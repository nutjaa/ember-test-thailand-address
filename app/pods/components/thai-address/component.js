import Ember from 'ember';
const { Component, RSVP, run } = Ember;

const numbers = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty'
];

const users = [
  { name: 'Arthur' },
  { name: 'Sam' },
  { name: 'Dan' },
  { name: 'Miguel' },
  { name: 'Svilen' },
  { name: 'Ruslan' },
  { name: 'Kirill' },
  { name: 'Stuart' },
  { name: 'Jamie' },
  { name: 'Matteo' }
];

export default Component.extend({
  numbers,
  users,
  actions: {
    search(term) {
      return numbers.filter((num) => num.indexOf(term) > -1);
    },

    skipShortSearches(term, select) {
      if (term.length <= 1) {
        select.actions.search('');
        return false;
      }
    },

    searchUsersAsync(term) {
      // return users.filter(u => u.name.indexOf(term) > -1);
      return new RSVP.Promise(function(resolve) {
        if (term.length === 0) {
          resolve([]);
        } else {
          run.later(function() {
            resolve(users.filter((u) => u.name.indexOf(term) > -1));
          }, 600);
        }
      });
    }
  }
});