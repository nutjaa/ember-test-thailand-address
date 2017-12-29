import Ember from 'ember';
const { Component, RSVP, run } = Ember;

export default Component.extend({

  data: [],

  sub_district: '',
  district: '',
  province: '',
  zipcode: '',
  address: {
    district: '',
    amphoe: '',
    province: '',
    zipcode: ''
  },

  init(){
    this._super(...arguments);
    let me = this;

    me.set('address.district',me.get('sub_district'));
    me.set('address.amphoe',me.get('district'));
    me.set('address.province',me.get('province'));
    me.set('address.zipcode',me.get('zipcode'));

    Ember.$.getJSON( "https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/db.json", function( data ) {
      me.preprocess(data);
    });
  },

  subDistrictChanged: Ember.observer('address.district', function() {
    console.log('data');
    this.set('sub_district',this.get('address.district'));
  }),

  districtChanged: Ember.observer('address.amphoe', function() {
    this.set('district',this.get('address.amphoe'));
  }),

  provinceChanged: Ember.observer('address.province', function() {
    this.set('province',this.get('address.province'));
  }),

  zipCodeChanged: Ember.observer('address.zipcode', function() {
    this.set('zipcode',this.get('address.zipcode'));
  }),

  preprocess(data){
    let lookup = [];
    let words = [];
    let expanded = [];
    let useLookup = false;
    let t;

    if (data.lookup && data.words) {
      // compact with dictionary and lookup
      useLookup = true;
      lookup = data.lookup.split('|');
      words = data.words.split('|');
      data = data.data;
    }

    t = function (text) {
      function repl (m) {
        let ch = m.charCodeAt(0);
        return words[ch < 97 ? ch - 65 : 26 + ch - 97];
      }
      if (!useLookup) {
        return text;
      }
      if (typeof text === 'number') {
        text = lookup[text];
      }
      return text.replace(/[A-Z]/ig, repl);
    }

    if (!data[0].length) {
      // non-compacted database
      return data;
    }
    // decompacted database in hierarchical form of:
    // [["province",[["amphur",[["district",["zip"...]]...]]...]]...]
    data.map(function (provinces) {
      let i = 1;
      if (provinces.length === 3) { // geographic database
        i = 2;
      }

      provinces[i].map(function (amphoes) {
        amphoes[i].map(function (districts) {
          districts[i] = districts[i] instanceof Array ? districts[i] : [districts[i]];
          districts[i].map(function (zipcode) {
            let entry = {
              district: t(districts[0]),
              amphoe: t(amphoes[0]),
              province: t(provinces[0]),
              zipcode: zipcode
            }
            if (i === 2) { // geographic database
              entry.district_code = districts[1] || false;
              entry.amphoe_code = amphoes[1] || false;
              entry.province_code = provinces[1] || false;
            }
            expanded.push(entry);
          });
        });
      });
    });
    this.set('data',expanded);
  },

  resolveResultbyField(type, searchStr, maxResult){
    searchStr = searchStr.toString().trim();
    let db = this.get('data');
    if (searchStr === '') {
      return [];
    }
    if (!maxResult) {
      maxResult = 20;
    }
    let possibles = [];
    try {
      possibles = db.filter(item => {
        let regex = new RegExp(searchStr, 'g');
        return (item[type] || '').toString().match(regex);
      }).slice(0, maxResult);
    } catch (e) {
      return [];
    }
    return possibles;
  },

  actions: {

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
    },


    searchBySubDistrict(term){
      return this.resolveResultbyField('district', term, 20);
    },

    searchByDistrict(term){
      return this.resolveResultbyField('amphoe', term, 20);
    },

    searchByProvince(term){
      return this.resolveResultbyField('province', term, 20);
    },

    searchByZipCode(term){
      return this.resolveResultbyField('zipcode', term, 20);
    },

    createSubdistrict(sub_district){
      this.set('address.district',sub_district);
    },
    createDistrict(district){
      this.set('address.amphoe',district);
    },
    createProvince(province){
      this.set('address.province',province);
    },
    createZipcode(zipcode){
      this.set('address.zipcode',zipcode);
    }
  }
});