/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * Create admin_users table
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.createTable('admin_users', {
        id: 'id',
        name: {
            type: 'varchar(255)',
            notNull: true,
        },
        email: {
            type: 'varchar(255)',
            notNull: true,
            unique: true,
        },
        phone_number: {
            type: 'varchar(20)',
            notNull: false,
        },
        password: {
            type: 'varchar(255)',
            notNull: true,
        },
        role: {
            type: 'varchar(50)',
            notNull: true,
            default: 'admin',
        },
        approved: {
            type: 'boolean',
            notNull: true,
            default: false,
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

    // Create indexes
    pgm.createIndex('admin_users', 'email', {
        name: 'idx_admin_users_email',
    });

    pgm.createIndex('admin_users', 'approved', {
        name: 'idx_admin_users_approved',
    });
};

/**
 * Drop admin_users table
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('admin_users');
};
