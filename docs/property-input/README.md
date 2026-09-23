# Property input

Use `project.template.json` for every project or marketed phase. Its version-2 keys
match the live catalog; the former documentation-only version-1 format is obsolete.
The template is an unpublished draft. Replace placeholders and remove unused rows.
`project.demo-example.json` is the current fictional Canopy record in the live format.

See [the complete field reference and publishing workflow](../DATA-STRUCTURE.md).
Put completed objects in the array in `data/properties.json`. Add the matching locality
to `data/localities.json`, then validate before setting `published: true`.
