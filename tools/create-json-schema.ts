import S from 'fluent-json-schema';

const iCalSchema = S.object()
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
      .prop('recurrenceRule', S.string())
      .prop('recurrenceDates', S.array().items(S.string()))
      .prop('exceptionDates', S.array().items(S.string())),
  )
  .id('http://Paqrat76/ical-gen-app')
  .title('Paqrat76/ical-gen-app Schema')
  .description(
    'Defines the JSON schema for the iCalendar JSON source file consumed by the Paqrat76/ical-gen-app CLI application',
  )
  .additionalProperties(false)
  .prop('name', S.string())
  .required()
  .prop('description', S.string())
  .prop('events', S.array().items(S.ref('#/definitions/event')).minItems(1))
  .required();

console.log(JSON.stringify(iCalSchema.valueOf(), undefined, 2));
