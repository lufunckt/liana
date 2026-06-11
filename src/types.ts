export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'number' | 'checkbox' | 'tags';

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  options?: string[]; // for select
}

export interface ModuleSchema {
  id: any;
  title: string;
  fields: FieldDefinition[];
  filterFields: string[];
}

export interface AppData {
  pessoas: any[];
  turmas: any[];
  materiais: any[];
  tarefas_suporte: any[];
  pagamentos: any[];
  perfis: any[];
  certificados_emitidos?: any[];
  certificados_templates?: any[];
  tags_personalizaveis?: any[];
}
