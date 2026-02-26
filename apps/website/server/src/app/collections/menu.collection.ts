import { Collection, Field, FieldType, RepeatBlock } from '@vertex-cms/common';

/**
 * Third-level or lower items are not supported in UI v1 to keep complexity low.
 */
@RepeatBlock()
export class MenuItemChild {
  @Field({ type: FieldType.Text, required: true, localized: true })
  label: string;

  @Field({ type: FieldType.Text, label: 'URL / Route (use absolute for internal, e.g. /docs)' })
  url: string;

  @Field({ type: FieldType.Boolean, label: 'Open in new tab' })
  openInNewTab: boolean;
}

@RepeatBlock()
export class MenuItem {
  @Field({ type: FieldType.Text, required: true, localized: true })
  label: string;

  @Field({ type: FieldType.Text, label: 'URL / Route (use absolute for internal, e.g. /docs)' })
  url: string;

  @Field({ type: FieldType.Boolean, label: 'Open in new tab' })
  openInNewTab: boolean;

  @Field({ type: FieldType.Boolean, label: 'Render as button' })
  button: boolean;

  @Field({ type: FieldType.Text, label: 'Custom CSS Class' })
  class: string;

  @Field({
    type: FieldType.Repeater,
    repeaterBlock: MenuItemChild,
    label: 'Submenu Items (Dropdown)',
  })
  children: MenuItemChild[];
}

@Collection({
  slug: 'menus',
  pluralName: 'Menus',
  singularName: 'Menu',
})
export class MenuCollection {
  @Field({
    type: FieldType.Text,
    required: true,
    unique: true,
    label: 'Menu Handle (e.g. main-nav)',
  })
  handle: string;

  @Field({
    type: FieldType.Text,
    required: true,
    label: 'Admin Label',
  })
  label: string;

  @Field({
    type: FieldType.Repeater,
    repeaterBlock: MenuItem,
    label: 'Menu Items',
  })
  items: MenuItem[];
}
