import type { Meta, StoryObj } from '@storybook/angular';
import { AutoloadComponent } from './autoload.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<AutoloadComponent> = {
  component: AutoloadComponent,
  title: 'AutoloadComponent',
};
export default meta;
type Story = StoryObj<AutoloadComponent>;

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
    expect(canvas.getByText(/autoload works!/gi)).toBeTruthy();
  },
};
