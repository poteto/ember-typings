import Ember from 'ember';
import { assertType } from './lib/assert';

type Person = typeof Person.prototype;
const Person = Ember.Object.extend({
    name: '',
    isHappy: false
});

const people = Ember.A([
    Person.create({ name: 'Yehuda', isHappy: true }),
    Person.create({ name: 'Majd', isHappy: false }),
]);

assertType<number>(people.get('length'));
assertType<Person>(people.get('lastObject'));
assertType<boolean>(people.isAny('isHappy'));
assertType<boolean>(people.isAny('isHappy', false));
assertType<Person[]>(people.filterBy('isHappy'));
assertType<typeof people>(people.get('[]'));
assertType<Person>(people.get('[]').get('firstObject'));

assertType<boolean[]>(people.mapBy('isHappy'));
assertType<any[]>(people.mapBy('name.length'));

assertType<string>(people.get('lastObject').get('name'));
assertType<boolean>(people.get('firstObject').get('isHappy'));

const letters: Ember.Enumerable<string> = Ember.A(['a', 'b', 'c']);
const codes: number[] = letters.map((item, index, enumerable) => {
    assertType<string>(item);
    assertType<number>(index);
    assertType<Ember.Enumerable<string>>(enumerable);
    return item.charCodeAt(0);
});
