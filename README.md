# Tmux Orchestrator

Ein Python-basiertes Kommandozeilen-Tool zur Automatisierung der Erstellung und Konfiguration von Tmux-Sitzungen basierend auf einer einfachen YAML-Datei.

## Features

- **YAML-basiert**: Definieren Sie komplexe Setups aus Fenstern und Panes in einer einfachen Konfigurationsdatei.
- **Automatische Befehlsausführung**: Führt beim Start automatisch definierte Befehle in jedem Pane aus.
- **Professionelles CLI**:
  - Flexible Angabe der Konfigurationsdatei.
  - `--dry-run`-Modus, um Änderungen zu simulieren, ohne sie auszuführen.
  - `--force`-Option, um bereits existierende Sessions zu überschreiben.
- **Robuste Validierung**: Prüft die Konfigurationsdatei auf Existenz und korrekte Struktur.

## Voraussetzungen

- Python 3.6+
- Tmux (muss auf dem System installiert sein, z.B. via `sudo apt install tmux` oder `brew install tmux`)

## Installation

1. **Repository klonen:**
   ```bash
   git clone https://github.com/cubetribe/tmux_start.git
   cd tmux_start
   ```

2. **Virtuelle Umgebung erstellen (empfohlen):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Abhängigkeiten installieren:**
   ```bash
   pip install -r requirements.txt
   ```

## Konfiguration

Erstellen Sie eine `.yaml`-Datei, die Ihre gewünschte Tmux-Struktur beschreibt. Eine `sample.yaml` ist als Beispiel enthalten.

```yaml
session_name: my-dev-session
windows:
  - window_name: editor
    panes:
      - commands:
          - nvim
  - window_name: services
    panes:
      - commands:
          - htop
      - commands:
          - echo "Starting frontend..."
```

## Nutzung

1. **Standardnutzung (nutzt config.yaml, falls vorhanden):**
   ```bash
   python3 main.py
   ```

2. **Eigene Konfigurationsdatei angeben:**
   ```bash
   python3 main.py sample.yaml
   ```

3. **Existierende Session überschreiben:**
   ```bash
   python3 main.py --force sample.yaml
   ```

4. **Vorschau der Änderungen ohne Ausführung:**
   ```bash
   python3 main.py --dry-run sample.yaml
   ```

5. **Hilfe anzeigen:**
   ```bash
   python3 main.py --help
   ```