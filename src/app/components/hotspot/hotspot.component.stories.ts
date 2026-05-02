import type { Meta, StoryObj } from '@storybook/angular';
import { HotspotComponent } from './hotspot.component';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<HotspotComponent> = {
  component: HotspotComponent,
  title: 'HotspotComponent',
};
export default meta;
type Story = StoryObj<HotspotComponent>;

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
    expect(canvas.getByText(/hotspot works!/gi)).toBeTruthy();
  },
};
