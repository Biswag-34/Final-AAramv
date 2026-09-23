# Locality input

Use `locality.template.json` for every locality. Its keys match the live catalog.
The template is an unpublished draft; replace every placeholder and remove unused rows.
`locality.demo-example.json` demonstrates additional numeric fields using a fictional
neighbourhood; its figures are not factual locality data and it is not published.

See [the complete field reference and publishing workflow](../DATA-STRUCTURE.md).
Put completed objects in the array in `data/localities.json`. Properties reference
these records through `localityId`, not by matching display names.
