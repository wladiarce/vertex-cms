import { pluginDbTypeorm } from './plugin-db-typeorm';

describe('pluginDbTypeorm', () => {
  it('should work', () => {
    expect(pluginDbTypeorm()).toEqual('plugin-db-typeorm');
  });
});
