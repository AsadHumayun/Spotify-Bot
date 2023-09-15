import { DataTypes } from 'sequelize';

const {
	STRING,
	TEXT,
} = DataTypes;

/**
 * Defines the 'channel' model and returns it
 * @param {import("sequelize").Sequelize} sequelize Sequelize instance
 * @returns {import("sequelize").Model<any, any>}
 */
export function Channel(sequelize) {
	return sequelize
		.define('channel', {
			id: {
				unique: true,
				allowNull: false,
				primaryKey: true,
				type: STRING,
			},
			postAccount: {
				type: TEXT,
				allowNull: false,
			},
		}, {
			timestamps: true,
		});
}
