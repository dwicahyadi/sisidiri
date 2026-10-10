import { DatabaseSync } from 'node:sqlite';
import { DIMENSIONS } from '../../features/quiz/scoring.js';

export class MasterRepository {
  constructor(path) {
    this.db = new DatabaseSync(path, { readOnly: true });
    this.db.exec('PRAGMA foreign_keys = ON; PRAGMA query_only = ON;');
    try { this.validate(); } catch (error) { this.close(); throw error; }
  }

  getDimensions() {
    return this.db.prepare('SELECT code, name, left_label AS leftLabel, right_label AS rightLabel FROM dimensions WHERE is_active = 1 ORDER BY sort_order').all();
  }

  getQuestions() {
    const questions = this.db.prepare(`SELECT q.id, d.code AS dimensionCode, q.text, q.is_randomizable AS isRandomizable
      FROM questions q JOIN dimensions d ON d.id = q.dimension_id
      WHERE q.is_active = 1 AND d.is_active = 1 ORDER BY d.sort_order, q.sort_order, q.id`).all();
    const getOptions = this.db.prepare('SELECT id, text, pole FROM question_options WHERE question_id = ? ORDER BY sort_order, id');
    return questions.map((q) => ({ ...q, isRandomizable: Boolean(q.isRandomizable), options: getOptions.all(q.id) }));
  }

  getType(code) {
    const row = this.db.prepare(`SELECT code AS type, title, short_description AS shortDescription,
      full_description AS fullDescription, strengths, challenges, communication_style AS communicationStyle,
      reflection_tips AS reflectionTips FROM personality_types WHERE code = ? AND is_active = 1`).get(code);
    if (!row) return null;
    return { ...row, strengths: JSON.parse(row.strengths), challenges: JSON.parse(row.challenges), reflectionTips: JSON.parse(row.reflectionTips) };
  }

  validate() {
    const fail = () => { throw new Error('Master kuis tidak konsisten. Periksa migrasi dan seed.'); };
    if (this.db.prepare('PRAGMA foreign_key_check').all().length) fail();
    const dimensions = this.getDimensions();
    if (dimensions.length !== 4 || dimensions.some((d, i) => d.code !== DIMENSIONS[i].code || !d.name.trim() || !d.leftLabel.trim() || !d.rightLabel.trim())) fail();
    const allActive = this.db.prepare('SELECT COUNT(*) AS count FROM questions WHERE is_active = 1').get().count;
    const questions = this.getQuestions();
    if (allActive !== 20 || questions.length !== 20) fail();
    for (const dimension of DIMENSIONS) {
      const group = questions.filter((q) => q.dimensionCode === dimension.code);
      if (group.length !== 5) fail();
      for (const q of group) {
        if (!q.text.trim() || q.options.length !== 2 || q.options.some((o) => !o.text.trim())) fail();
        const poles = q.options.map((o) => o.pole);
        if (!poles.includes(dimension.left) || !poles.includes(dimension.right)) fail();
      }
    }
    const types = this.db.prepare('SELECT code FROM personality_types WHERE is_active = 1').all();
    if (types.length !== 16 || types.some((t) => !/^[EI][SN][TF][JP]$/.test(t.code))) fail();
    for (const { code } of types) {
      const item = this.getType(code);
      if ([item.title, item.shortDescription, item.fullDescription, item.communicationStyle].some((v) => typeof v !== 'string' || !v.trim())) fail();
      if ([item.strengths, item.challenges, item.reflectionTips].some((v) => !Array.isArray(v) || !v.length || v.some((s) => typeof s !== 'string' || !s.trim()))) fail();
    }
  }

  close() { this.db.close(); }
}
