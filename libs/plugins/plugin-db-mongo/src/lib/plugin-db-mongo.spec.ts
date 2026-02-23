import { pluginDbMongo } from './plugin-db-mongo';

describe('pluginDbMongo', () => {
  it('should work', () => {
    expect(pluginDbMongo()).toEqual('plugin-db-mongo');
  });
});
