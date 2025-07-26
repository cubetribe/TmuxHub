#!/usr/bin/env python3
"""
Tmux-Orchestrator - A tool to manage and orchestrate tmux sessions
"""

import libtmux
import yaml
import argparse
import sys
import time
from pathlib import Path


def load_config(config_path):
    """Load YAML configuration from file"""
    with open(config_path, 'r', encoding='utf-8') as file:
        config = yaml.safe_load(file)
    return config


def connect_to_tmux():
    """Connect to tmux server"""
    try:
        server = libtmux.Server()
        # Test connection by accessing sessions
        _ = server.sessions
        print(f"✓ Verbindung zu tmux erfolgreich. Gefundene Sessions: {len(server.sessions)}")
        return server
    except Exception as e:
        print(f"✗ Fehler bei der Verbindung zu tmux: {e}")
        print("Stellen Sie sicher, dass tmux installiert und verfügbar ist.")
        return None


def create_session(server, session_name, force=False):
    """Create a new tmux session, handling existing sessions"""
    existing_session = None
    
    # Check if session already exists
    for session in server.sessions:
        if session.name == session_name:
            existing_session = session
            break
    
    if existing_session:
        if force:
            print(f"⚠ Session '{session_name}' existiert bereits. Wird überschrieben (--force)...")
            existing_session.kill_session()
        else:
            print(f"⚠ Session '{session_name}' existiert bereits.")
            response = input("Möchten Sie die bestehende Session überschreiben? (j/n): ").lower()
            
            if response in ['j', 'ja', 'y', 'yes']:
                print(f"Lösche bestehende Session '{session_name}'...")
                existing_session.kill_session()
            else:
                print("Vorgang abgebrochen.")
                return None
    
    # Create new session
    try:
        session = server.new_session(session_name=session_name, detach=True)
        print(f"✓ Session '{session_name}' erfolgreich erstellt.")
        return session
    except Exception as e:
        print(f"✗ Fehler beim Erstellen der Session: {e}")
        return None


def execute_commands(pane, commands):
    """Execute commands in a tmux pane"""
    if not commands:
        print(f"      ⚠ Keine Befehle für Pane gefunden.")
        return 0
    
    executed_count = 0
    
    for j, command in enumerate(commands, 1):
        try:
            print(f"      → Befehl {j}: {command}")
            pane.send_keys(command)
            executed_count += 1
            # Small delay between commands
            time.sleep(0.1)
        except Exception as e:
            print(f"      ✗ Fehler beim Ausführen von Befehl {j} '{command}': {e}")
            continue
    
    return executed_count


def create_panes(window, panes_config):
    """Create panes in the tmux window based on configuration"""
    if not panes_config:
        print(f"    ⚠ Keine Pane-Konfiguration für Fenster '{window.name}' gefunden.")
        return []
    
    created_panes = []
    
    for i, pane_config in enumerate(panes_config):
        try:
            if i == 0:
                # First pane: use the existing default pane
                pane = window.panes[0]
                print(f"    ✓ Standard-Pane verwendet (Pane {i+1})")
            else:
                # Additional panes: split the window horizontally
                pane = window.split_window()
                print(f"    ✓ Neues Pane erstellt (Pane {i+1})")
            
            created_panes.append(pane)
            
            # Execute commands for this pane
            commands = pane_config.get('commands', [])
            if commands:
                print(f"      Führe {len(commands)} Befehle aus...")
                executed_count = execute_commands(pane, commands)
                print(f"      ✓ {executed_count}/{len(commands)} Befehle ausgeführt")
            else:
                print(f"      → Keine Befehle für Pane {i+1}")
            
        except Exception as e:
            print(f"    ✗ Fehler beim Erstellen von Pane {i+1}: {e}")
            continue
    
    return created_panes


def create_windows(session, windows_config):
    """Create windows in the tmux session based on configuration"""
    if not windows_config:
        print("⚠ Keine Fenster-Konfiguration gefunden.")
        return [], {}, 0
    
    created_windows = []
    window_panes_map = {}
    total_commands_executed = 0
    
    for i, window_config in enumerate(windows_config):
        window_name = window_config.get('window_name', f'window-{i+1}')
        
        try:
            if i == 0:
                # First window: rename the default window created with the session
                window = session.windows[0]
                window.rename_window(window_name)
                print(f"  ✓ Standard-Fenster umbenannt zu '{window_name}'")
            else:
                # Additional windows: create new windows
                window = session.new_window(window_name=window_name)
                print(f"  ✓ Neues Fenster '{window_name}' erstellt")
            
            created_windows.append(window)
            
            # Create panes for this window
            panes_config = window_config.get('panes', [])
            if panes_config:
                print(f"    Erstelle {len(panes_config)} Panes...")
                created_panes = create_panes(window, panes_config)
                window_panes_map[window_name] = created_panes
                
                # Count commands executed in this window
                window_commands = sum(len(pane_config.get('commands', [])) for pane_config in panes_config)
                total_commands_executed += window_commands
                
                print(f"    → Fenster '{window_name}' mit {len(created_panes)} Panes fertig")
            else:
                window_panes_map[window_name] = []
                print(f"    → Fenster '{window_name}' ohne Panes")
            
        except Exception as e:
            print(f"  ✗ Fehler beim Erstellen des Fensters '{window_name}': {e}")
            continue
    
    return created_windows, window_panes_map, total_commands_executed


def validate_config(config):
    """Validate the configuration structure"""
    if not isinstance(config, dict):
        return False, "Konfiguration muss ein YAML-Dictionary sein"
    
    if 'session_name' not in config:
        return False, "Konfiguration muss 'session_name' enthalten"
    
    if not config['session_name']:
        return False, "'session_name' darf nicht leer sein"
    
    if 'windows' not in config:
        return False, "Konfiguration muss 'windows' Array enthalten"
    
    if not isinstance(config['windows'], list):
        return False, "'windows' muss eine Liste sein"
    
    if not config['windows']:
        return False, "'windows' darf nicht leer sein"
    
    return True, "Konfiguration ist valide"


def main():
    """Main entry point for the Tmux-Orchestrator"""
    parser = argparse.ArgumentParser(
        description="Tmux-Orchestrator - Verwalte und orchestriere tmux-Sessions automatisch",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Beispiele:
  %(prog)s                        # Nutzt config.yaml
  %(prog)s sample.yaml            # Nutzt sample.yaml
  %(prog)s --force sample.yaml    # Überschreibt existierende Session
  %(prog)s --dry-run config.yaml  # Zeigt nur an, was gemacht würde
        """
    )
    
    parser.add_argument(
        "config_file",
        nargs="?",
        default="config.yaml",
        help="Pfad zur YAML-Konfigurationsdatei (Standard: config.yaml)"
    )
    
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Zeigt nur an, was ausgeführt würde, ohne Änderungen vorzunehmen"
    )
    
    parser.add_argument(
        "--force",
        action="store_true",
        help="Überschreibt existierende Session ohne Nachfrage"
    )
    
    parser.add_argument(
        "--version", 
        action="version", 
        version="Tmux-Orchestrator 1.0.0"
    )
    
    args = parser.parse_args()
    
    # Validate configuration file exists
    config_path = Path(args.config_file)
    if not config_path.exists():
        print(f"✗ Konfigurationsdatei '{args.config_file}' wurde nicht gefunden!")
        if args.config_file == "config.yaml":
            print("💡 Tipp: Erstellen Sie eine config.yaml oder nutzen Sie sample.yaml:")
            print("   python main.py sample.yaml")
        sys.exit(1)
    
    # Load and validate configuration
    print(f"Lade Konfiguration aus '{args.config_file}'...")
    try:
        config = load_config(args.config_file)
        valid, message = validate_config(config)
        if not valid:
            print(f"✗ Ungültige Konfiguration: {message}")
            sys.exit(1)
        
        print(f"✓ Konfiguration erfolgreich geladen:")
        print(f"  Session-Name: {config.get('session_name')}")
        print(f"  Anzahl Windows: {len(config.get('windows', []))}")
        
        if args.dry_run:
            print(f"\n🔍 DRY RUN - Keine Änderungen werden vorgenommen:")
            print(f"  Würde Session '{config['session_name']}' erstellen")
            for window in config.get('windows', []):
                window_name = window.get('window_name', 'unbenannt')
                panes_count = len(window.get('panes', []))
                commands_count = sum(len(pane.get('commands', [])) for pane in window.get('panes', []))
                print(f"  Würde Fenster '{window_name}' mit {panes_count} Panes und {commands_count} Befehlen erstellen")
            print(f"\n💡 Führen Sie ohne --dry-run aus, um die Session zu erstellen.")
            return
        
        print()
    except Exception as e:
        print(f"✗ Fehler beim Laden der Konfiguration: {e}")
        sys.exit(1)
    
    # Connect to tmux
    print("Verbinde mit tmux...")
    server = connect_to_tmux()
    if not server:
        sys.exit(1)
    print()
    
    # Create session
    session_name = config.get('session_name')
    print(f"Erstelle Session '{session_name}'...")
    session = create_session(server, session_name, force=args.force)
    if not session:
        sys.exit(1)
    print()
    
    # Create windows and panes from configuration
    windows_config = config.get('windows', [])
    print(f"Erstelle {len(windows_config)} Fenster...")
    created_windows, window_panes_map, total_commands_executed = create_windows(session, windows_config)
    
    # Calculate total panes
    total_panes = sum(len(panes) for panes in window_panes_map.values())
    
    # Summary
    print(f"\n🎉 Tmux-Orchestrator Setup abgeschlossen!")
    print(f"  Session: '{session_name}'")
    print(f"  Erstellte Fenster: {len(created_windows)}/{len(windows_config)}")
    print(f"  Erstellte Panes gesamt: {total_panes}")
    print(f"  Ausgeführte Befehle gesamt: {total_commands_executed}")
    
    if created_windows:
        print(f"  Fenster-Namen: {', '.join([w.name for w in created_windows])}")
    
    # Detailed pane statistics
    if window_panes_map:
        print(f"\n📊 Detaillierte Übersicht:")
        for window_name, panes in window_panes_map.items():
            # Count commands in this window
            window_config = next((wc for wc in windows_config if wc.get('window_name') == window_name), {})
            panes_config = window_config.get('panes', [])
            window_commands = sum(len(pane_config.get('commands', [])) for pane_config in panes_config)
            print(f"  • {window_name}: {len(panes)} Panes, {window_commands} Befehle")
    
    print(f"\n📋 Verbindungsanweisungen:")
    print(f"  Session anzeigen: tmux attach-session -t {session_name}")
    print(f"  Alle Sessions: tmux list-sessions")
    print(f"  Fenster anzeigen: tmux list-windows -t {session_name}")
    print(f"  Panes anzeigen: tmux list-panes -t {session_name}")
    
    print(f"\n🚀 Ihre tmux-Session '{session_name}' ist bereit und alle Befehle wurden ausgeführt!")
    print(f"   Verbinden Sie sich mit: tmux attach-session -t {session_name}")


if __name__ == "__main__":
    main()