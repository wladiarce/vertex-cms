import { Collection, Field, FieldType } from '@vertex/common';

@Collection({
  slug: 'movies',
  singularName: 'Movie',
  timestamps: true
})
export class Movie {
  @Field({ 
    type: FieldType.Text, 
    required: true, 
    label: 'Movie Title' 
  })
  title: string;

  @Field({ 
    type: FieldType.Number, 
    label: 'Release Year',
    min: 1900 
  })
  year: number;

  @Field({
    type: FieldType.Select,
    options: [
      { label: 'Action', value: 'action' },
      { label: 'Drama', value: 'drama' }
    ]
  })
  genre: string;
}