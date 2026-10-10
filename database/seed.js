import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { questions } from './questions.js';
import { personalityTypes } from './personality-types.js';
import { MasterRepository } from '../src/infrastructure/database/repository.js';

const dimensions = [
  [1, 'EI', 'Energi & interaksi', 'Ekstrovert', 'Introvert', 1],
  [2, 'SN', 'Cara menerima informasi', 'Sensing', 'Intuition', 2],
  [3, 'TF', 'Pertimbangan keputusan', 'Thinking', 'Feeling', 3],
  [4, 'JP', 'Cara mengatur kegiatan', 'Judging', 'Perceiving', 4],
];

export function seedDatabase(path) {
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(readFileSync(fileURLToPath(new URL('./schema.sql', import.meta.url)), 'utf8'));
  db.exec('BEGIN IMMEDIATE');
  try {
    const dimension = db.prepare(`INSERT INTO dimensions (id,code,name,left_label,right_label,sort_order,is_active)
      VALUES (?,?,?,?,?,?,1) ON CONFLICT(id) DO UPDATE SET code=excluded.code,name=excluded.name,left_label=excluded.left_label,right_label=excluded.right_label,sort_order=excluded.sort_order,is_active=1`);
    for (const row of dimensions) dimension.run(...row);
    const question = db.prepare(`INSERT INTO questions (id,dimension_id,text,sort_order,is_active,is_randomizable)
      VALUES (?,?,?,?,1,?) ON CONFLICT(id) DO UPDATE SET dimension_id=excluded.dimension_id,text=excluded.text,sort_order=excluded.sort_order,is_active=1,is_randomizable=excluded.is_randomizable`);
    const option = db.prepare(`INSERT INTO question_options (id,question_id,text,pole,sort_order)
      VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET question_id=excluded.question_id,text=excluded.text,pole=excluded.pole,sort_order=excluded.sort_order`);
    for (const q of questions) {
      const dimensionId = dimensions.find((d) => d[1] === q.dimensionCode)[0];
      question.run(q.id, dimensionId, q.text, q.sortOrder, Number(q.isRandomizable));
      q.options.forEach((o, index) => option.run(o.id, q.id, o.text, o.pole, index + 1));
    }
    const type = db.prepare(`INSERT INTO personality_types (code,title,short_description,full_description,strengths,challenges,communication_style,reflection_tips,is_active)
      VALUES (?,?,?,?,?,?,?,?,1) ON CONFLICT(code) DO UPDATE SET title=excluded.title,short_description=excluded.short_description,full_description=excluded.full_description,strengths=excluded.strengths,challenges=excluded.challenges,communication_style=excluded.communication_style,reflection_tips=excluded.reflection_tips,is_active=1`);
    for (const p of personalityTypes) type.run(p.code, p.title, p.shortDescription, p.fullDescription, JSON.stringify(p.strengths), JSON.stringify(p.challenges), p.communicationStyle, JSON.stringify(p.reflectionTips));
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  } finally { db.close(); }
  const repository = new MasterRepository(path);
  repository.close();
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  seedDatabase(resolve(process.env.DATABASE_PATH || 'database/personality.sqlite'));
  console.log('Master siap: 4 dimensi, 20 pertanyaan, 40 opsi, dan 16 tipe.');
}
