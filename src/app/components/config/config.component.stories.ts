import type { Meta, StoryObj } from '@storybook/angular';
import { ConfigComponent } from './config.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<ConfigComponent> = {
  component: ConfigComponent,
  title: 'ConfigComponent',
};
export default meta;
type Story = StoryObj<ConfigComponent>;

export const Primary: Story = {
  args: {
    data: '',
  },
};

export const Heading: Story = {
  args: {
    data: '',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/config works!/gi)).toBeTruthy();
  },
};
