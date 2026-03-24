/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * Create hero_banners table for landing page hero section
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('hero_banners', {
        id: 'id',
        image_url: {
            type: 'varchar(500)',
            notNull: true,
        },
        title: {
            type: 'varchar(255)',
            notNull: true,
        },
        subtitle: {
            type: 'varchar(255)',
            notNull: false,
        },
        headtext: {
            type: 'text',
            notNull: false,
        },
        text_color: {
            type: 'varchar(50)',
            notNull: false,
            default: '#000000',
        },
        cta_button_color: {
            type: 'varchar(50)',
            notNull: false,
            default: '#000000',
        },
        cta_button_text_color: {
            type: 'varchar(50)',
            notNull: false,
            default: '#FFFFFF',
        },
        cta_button_text: {
            type: 'varchar(100)',
            notNull: false,
        },
        is_active: {
            type: 'boolean',
            notNull: true,
            default: true,
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    pgm.createIndex('hero_banners', 'is_active');
};

/**
 * Drop hero_banners table
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('hero_banners');
};
