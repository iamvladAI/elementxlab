import { type SchemaTypeDefinition } from 'sanity'

const landingPageSchema: SchemaTypeDefinition = {
  name: 'landingPage',
  title: 'Контент головної сторінки',
  type: 'document',
  groups: [
    { name: 'hero', title: '1. Головний екран' },
    { name: 'metrics', title: '2. Метрики та Вступ' },
    { name: 'formulas', title: '3. Формули' },
    { name: 'brands', title: '4. Бренди' },
    { name: 'gmp', title: '5. Сертифікація GMP' },
    { name: 'tour', title: '6. Екскурсія (За лаштунками)' },
    { name: 'contact', title: '7. Контакти' },
  ],
  fields: [
    {
      name: 'hero',
      title: 'Головний екран',
      type: 'object',
      group: 'hero',
      fields: [
        { name: 'title', title: 'Заголовок', type: 'string' },
        { name: 'subtitle', title: 'Підзаголовок', type: 'text' },
      ],
    },
    {
      name: 'introText',
      title: 'Вступний текст (Ринок beauty-індустрії...)',
      type: 'text',
      group: 'metrics',
    },
    {
      name: 'metrics',
      title: 'Метрики (цифри)',
      type: 'array',
      group: 'metrics',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', title: 'Цифра (наприклад, 10+)', type: 'string' },
            { name: 'description', title: 'Опис', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'formulasTitle',
      title: 'Заголовок блоку "Перевірені формули"',
      type: 'string',
      group: 'formulas',
    },
    {
      name: 'formulas',
      title: 'Категорії формул',
      type: 'array',
      group: 'formulas',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Назва категорії', type: 'string' },
            { name: 'image', title: 'Зображення', type: 'image', options: { hotspot: true } },
            { 
              name: 'tags', 
              title: 'Теги (бульбашки навколо баночки)', 
              type: 'array', 
              of: [{ type: 'string' }] 
            },
          ],
        },
      ],
    },
    {
      name: 'brands',
      title: 'Наші бренди',
      type: 'array',
      group: 'brands',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Назва бренду (для зручності)', type: 'string' },
            { name: 'logo', title: 'Логотип (SVG/PNG)', type: 'image', options: { hotspot: true } },
            { name: 'description', title: 'Опис бренду', type: 'text' },
            { name: 'backgroundImage', title: 'Фонове фото', type: 'image', options: { hotspot: true } },
          ],
        },
      ],
    },
    {
      name: 'gmp',
      title: 'Сертифікація GMP',
      type: 'object',
      group: 'gmp',
      fields: [
        { name: 'title', title: 'Заголовок', type: 'string' },
        { name: 'description', title: 'Опис', type: 'text' },
        { name: 'certificateImage', title: 'Фото сертифікату', type: 'image', options: { hotspot: true } },
        {
          name: 'accordion',
          title: 'Пункти акордеону',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                { name: 'title', title: 'Заголовок пункту', type: 'string' },
                { name: 'content', title: 'Текст пункту', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'tour',
      title: 'Екскурсія (За лаштунками)',
      type: 'object',
      group: 'tour',
      fields: [
        { name: 'title', title: 'Заголовок', type: 'string' },
        { name: 'description', title: 'Опис', type: 'text' },
        { name: 'buttonText', title: 'Текст кнопки', type: 'string' },
      ],
    },
    {
      name: 'contact',
      title: 'Контакти (Футер та сторінка Contact)',
      type: 'object',
      group: 'contact',
      fields: [
        { name: 'email', title: 'Email', type: 'string' },
        { name: 'phone', title: 'Телефон (наприклад, +38 (068) 931 64 78)', type: 'string' },
        { name: 'phoneLink', title: 'Посилання для дзвінка (наприклад, +380689316478)', type: 'string' },
        { name: 'founderQuote', title: 'Цитата засновника', type: 'text' },
        { name: 'founderName', title: 'Ім\'я засновника', type: 'string' },
        { name: 'founderRole', title: 'Роль засновника', type: 'string' },
        { name: 'founderImage', title: 'Фото засновника', type: 'image', options: { hotspot: true } },
      ],
    },
  ],
}

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [landingPageSchema],
}
