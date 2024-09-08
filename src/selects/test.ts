import { ComponentType } from "discord.js";
import Select from "../classes/Select";
import User from "../entity/User";

const TestSelect = new Select({
    identifier: 'test',
    placeholder: {
        'en-US': 'Test Button',
    },
    fields: [
        {
            name: 'test',
            type: 'STRING',
            required: true,
        },
    ] as const,
    repositories: [User] as const,
    options: async (client, userRepository) => {
        return [
            {
                label: 'Test',
                value: 'test',
                description: 'Test123',
            }
        ]
    },
    type: ComponentType.StringSelect,
    execute: async (interaction, options, client, userRepository) => {
        console.log(interaction.values, options.test)
    },
});

export default TestSelect;