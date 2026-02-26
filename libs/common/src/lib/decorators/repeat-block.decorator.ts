import 'reflect-metadata';

export const REPEAT_BLOCK_METADATA_KEY = 'vertex:repeater-block';

/**
 * Marks a plain class as a Repeater row shape.
 * Use `@Field` decorators on its properties to define the fields of each row.
 * Reference the class in a parent @Block via:
 *   @Field({ type: FieldType.Repeater, repeaterBlock: MyClass })
 */
export function RepeatBlock(): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(REPEAT_BLOCK_METADATA_KEY, true, target);
  };
}
