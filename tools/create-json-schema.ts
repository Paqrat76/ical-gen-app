import S from 'fluent-json-schema';

// NOTE: False positives possible due to how the `oneOf` keyword is handled by JSON Schema validation libraries.
// The `oneOf` keyword allows for multiple schemas to be valid for a given property, but it does not guarantee that
// only one of the schemas will be used. This can lead to false positives where a property is validated against
// multiple schemas, even if only one is intended.
//
// The clue is to look for `"keyword": "oneOf"` and `"message": "must match exactly one schema in oneOf"` in the list of
// errors. If the "instancePath" for the errors starts with "/events/0" (0 can be any array index value)
// and the errors are for a "timedEvent", the errors having the "schemaPath" start with "#/definitions/allDayEvent/..."
// are the false positives and can be ignored. The reverse is also true when the errors are for an "allDayEvent",
// the errors having the "schemaPath" start with "#/definitions/timedEvent/..." can be ignored.

const iCalSchema = S.object()
  .id('http://Paqrat76/ical-gen-app')
  .title('Paqrat76/ical-gen-app Schema')
  .description(
    'Defines the JSON schema for the iCalendar JSON source file consumed by the Paqrat76/ical-gen-app CLI application',
  )
  .additionalProperties(false)
  .definition('allDayEvent', S.object().prop('allDayStart', S.string().format('date')).required())
  .definition(
    'timedEvent',
    S.object()
      .prop('start', S.string().format('date-time'))
      .required()
      .prop('end', S.string().format('date-time'))
      .required(),
  )
  .definition(
    'event',
    S.object()
      .oneOf([S.ref('#/definitions/allDayEvent'), S.ref('#/definitions/timedEvent')])
      .prop('summary', S.string())
      .required()
      .prop('description', S.string())
      .prop('categories', S.array().items(S.string()))
      .prop('location', S.string())
      // NOTE: Use the [RRULE Tool](https://icalendar.org/rrule-tool.html.html) to create recurrence rules.
      // Prepend "RRULE:" to the generated recurrence rule.
      .prop('recurrenceRule', S.string().pattern(`^RRULE:.+$`)),
  )
  .prop('name', S.string())
  .required()
  .prop('description', S.string())
  .prop('events', S.array().items(S.ref('#/definitions/event')).minItems(1))
  .required();

console.log(JSON.stringify(iCalSchema.valueOf(), undefined, 2));
