"""Garantit que main.py / extraction.py / scoring.py sont importables quel
que soit le répertoire courant depuis lequel `pytest` est lancé."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
