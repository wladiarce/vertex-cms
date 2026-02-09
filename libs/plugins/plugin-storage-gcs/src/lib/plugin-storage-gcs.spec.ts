import { pluginStorageGcs } from './plugin-storage-gcs';

describe('pluginStorageGcs', () => {
  it('should work', () => {
    expect(pluginStorageGcs()).toEqual('plugin-storage-gcs');
  });
});
