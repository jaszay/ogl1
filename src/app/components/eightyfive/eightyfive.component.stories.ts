import type { Meta, StoryObj } from '@storybook/angular';
import { EightyfiveComponent } from './eightyfive.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<EightyfiveComponent> = {
  component: EightyfiveComponent,
  title: 'EightyfiveComponent',
};
export default meta;
type Story = StoryObj<EightyfiveComponent>;

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
    expect(canvas.getByText(/eightyfive works!/gi)).toBeTruthy();
  },
};
