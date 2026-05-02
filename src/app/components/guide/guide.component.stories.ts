import type { Meta, StoryObj } from '@storybook/angular';
import { GuideComponent } from './guide.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<GuideComponent> = {
  component: GuideComponent,
  title: 'GuideComponent',
};
export default meta;
type Story = StoryObj<GuideComponent>;

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
    expect(canvas.getByText(/guide works!/gi)).toBeTruthy();
  },
};
