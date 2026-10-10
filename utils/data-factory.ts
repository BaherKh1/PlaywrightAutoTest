import { faker } from '@faker-js/faker';

/** Random but realistic test data, so tests never depend on stale hard-coded values. */
export function buildCheckoutInfo() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode(),
  };
}

export function buildPost() {
  return {
    title: faker.lorem.sentence(4),
    body: faker.lorem.paragraph(),
    userId: faker.number.int({ min: 1, max: 10 }),
  };
}
