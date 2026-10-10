PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS dimensions (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE CHECK (code IN ('EI','SN','TF','JP')),
  name TEXT NOT NULL,
  left_label TEXT NOT NULL,
  right_label TEXT NOT NULL,
  sort_order INTEGER NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1))
);
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY,
  dimension_id INTEGER NOT NULL REFERENCES dimensions(id),
  text TEXT NOT NULL CHECK (length(trim(text)) > 0),
  sort_order INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
  is_randomizable INTEGER NOT NULL DEFAULT 0 CHECK (is_randomizable IN (0,1))
);
CREATE TABLE IF NOT EXISTS question_options (
  id INTEGER PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  text TEXT NOT NULL CHECK (length(trim(text)) > 0),
  pole TEXT NOT NULL CHECK (pole IN ('E','I','S','N','T','F','J','P')),
  sort_order INTEGER NOT NULL,
  UNIQUE (question_id, pole),
  UNIQUE (question_id, sort_order)
);
CREATE TABLE IF NOT EXISTS personality_types (
  code TEXT PRIMARY KEY CHECK (length(code) = 4),
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  strengths TEXT NOT NULL,
  challenges TEXT NOT NULL,
  communication_style TEXT NOT NULL,
  reflection_tips TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1))
);
