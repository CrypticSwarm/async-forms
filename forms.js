var step = require('step')
, Form = exports.Form = function Form(name, fields, opts) {
  this.name = name;
  this.fields = fields;
  Object.keys(fields).forEach(function(key){
    fields[key].name = name + '[' + key + ']'
  })
  if (opts && opts.postValidator) this.postValidator = opts.postValidator
}
, ValidatorError = exports.ValidatorError = function ValidatorError(field, message) {
  this.name = 'ValidatorError';
  Error.call(this, message);
  Error.captureStackTrace(this, arguments.callee);
  this.message = message;
  this.field = field.name
  this.fieldVal = field.value;
}
ValidatorError.prototype.__proto__ = Error.prototype

Form.prototype.bindValues = function bindValues(values) {
  this.values = values;
}

Form.prototype.validate = function validate(callback) {
  var fields = this.fields
    , values = this.values
    , form = this
    , error = this.error = this.error || {};
  step
    ( function(){
        var calledValidator = false;
        Object.keys(fields).forEach(function(fieldName) {
          if (fields[fieldName].required !== false && fields[fieldName].validator) {
            calledValidator = true;
            if (values[fieldName] == null || values[fieldName] === '') {
              var err = new ValidatorError(fields[fieldName], 'required field');
              error[fieldName] = err;
              return this.parallel()(err);
            }
            fields[fieldName].value = values[fieldName];
            fields[fieldName].validator(fields[fieldName], values[fieldName], validatorCallbackGen(this.parallel()));
          }
        }, this);
        if (form.postValidator) {
          calledValidator = true;
          form.postValidator(validatorCallbackGen(this.parallel()));
        }
        if (!calledValidator) this();
      }
    , function (err) {
        this(err ? false : true);
      }
    , callback
    );
    
  function validatorCallbackGen(cb) {
    return function validatorCallback(err) {
      if (err) {
        var matches = /\[(.*)\]/.exec(err.field) 
        error[matches[1]] = err
      }
      cb(err);
    }
  }
}

exports.validator = {}

exports.validator.regex = function(regex, options) {
  options = options || {};
  var msg = options.msg || 'invalid'
  return function(field, val, callback) {
    if(regex.test(val)) return callback();
    var err = new ValidatorError(field, msg);
    return callback(err);
  }
}

exports.validator.length = function length(len, options) {
  return function lengthValidator(field, val, callback) {
    var msg = '';
    if (typeof len === 'number' && val.length > len) msg += 'numerical.  Greater than upper bound.';
    if (len.min != null && len.min > val.length) msg += 'under min lower bound';
    if (len.max != null && len.max < val.length) msg += 'over max upper bound';
    if (!msg) return callback();
    var err = new ValidatorError(field, 'invalid length' + msg)
    callback(err);
  }
}

exports.validator.email = function email(options) {
  return exports.validator.regex(/^[a-zA-Z][\w\-]*\w(\+[\w\-]*\w)?@\w+\.\w{2,}/, options)
}

function inputType(type) {
  return function inputTypeForm(name, val, buf, opts) {
    buf.push('<input type="' + type + '" name="' + name + '"')
    if (val != null) buf.push(' value="'+ val + '"');
    buf.push(' />');
  }
}

exports.widgets = {}
exports.widgets.text = inputType('text')
exports.widgets.password = inputType('password')
exports.widgets.checkbox = inputType('checkbox')

exports.widgets.choice = function(choices, defaultVal) {
  var keys = Object.keys(choices);
  return function renderChoiceWidget(name, val, buf, opts) {
    if (val == null) val = defaultVal;
    buf.push('<select name="' + name + '">');
    keys.forEach(function(choice){
      buf.push('<option value="' + choice + '"')
      if(val == choice) buf.push(' selected="selected"')
      buf.push('>' + choices[choice] + '</option>')
    })
    buf.push('</select>')
  }
}



exports.widgets.country = function(defaultVal) {
  return exports.widgets.choice(
    { "AF": "Afghanistan"
    , "AL": "Albania"
    , "DZ": "Algeria"
    , "AS": "American Samoa"
    , "1": "Americas"
    , "AD": "Andorra"
    , "AO": "Angola"
    , "AI": "Anguilla"
    , "AQ": "Antarctica"
    , "AG": "Antigua and Barbuda"
    , "AR": "Argentina"
    , "AM": "Armenia"
    , "AW": "Aruba"
    , "142": "Asia"
    , "AU": "Australia"
    , "43": "Australia and New Zealand"
    , "AT": "Austria"
    , "AZ": "Azerbaijan"
    , "BS": "Bahamas"
    , "BH": "Bahrain"
    , "BD": "Bangladesh"
    , "BB": "Barbados"
    , "BY": "Belarus"
    , "BE": "Belgium"
    , "BZ": "Belize"
    , "BJ": "Benin"
    , "BM": "Bermuda"
    , "BT": "Bhutan"
    , "BO": "Bolivia"
    , "BA": "Bosnia and Herzegovina"
    , "BW": "Botswana"
    , "BV": "Bouvet Island"
    , "BR": "Brazil"
    , "IO": "British Indian Ocean Territory"
    , "VG": "British Virgin Islands"
    , "BN": "Brunei"
    , "BG": "Bulgaria"
    , "BF": "Burkina Faso"
    , "BI": "Burundi"
    , "KH": "Cambodia"
    , "CM": "Cameroon"
    , "CA": "Canada"
    , "CV": "Cape Verde"
    , "2": "Caribbean"
    , "KY": "Cayman Islands"
    , "CF": "Central African Republic"
    , "11": "Central America"
    , "143": "Central Asia"
    , "TD": "Chad"
    , "830": "Channel Islands"
    , "CL": "Chile"
    , "CN": "China"
    , "CX": "Christmas Island"
    , "CC": "Cocos [Keeling] Islands"
    , "CO": "Colombia"
    , "172": "Commonwealth of Independent States"
    , "KM": "Comoros"
    , "CG": "Congo - Brazzaville"
    , "CD": "Congo - Kinshasa"
    , "CK": "Cook Islands"
    , "CR": "Costa Rica"
    , "HR": "Croatia"
    , "CU": "Cuba"
    , "CY": "Cyprus"
    , "CZ": "Czech Republic"
    , "200": "Czechoslovakia"
    , "CI": "Côte d’Ivoire"
    , "DK": "Denmark"
    , "DJ": "Djibouti"
    , "DM": "Dominica"
    , "DO": "Dominican Republic"
    , "12": "Eastern Africa"
    , "24": "Eastern Asia"
    , "151": "Eastern Europe"
    , "EC": "Ecuador"
    , "EG": "Egypt"
    , "SV": "El Salvador"
    , "GQ": "Equatorial Guinea"
    , "ER": "Eritrea"
    , "EE": "Estonia"
    , "ET": "Ethiopia"
    , "150": "Europe"
    , "QU": "European Union"
    , "FK": "Falkland Islands"
    , "FO": "Faroe Islands"
    , "FJ": "Fiji"
    , "FI": "Finland"
    , "FR": "France"
    , "GF": "French Guiana"
    , "PF": "French Polynesia"
    , "TF": "French Southern Territories"
    , "GA": "Gabon"
    , "GM": "Gambia"
    , "GE": "Georgia"
    , "DE": "Germany"
    , "GH": "Ghana"
    , "GI": "Gibraltar"
    , "GR": "Greece"
    , "GL": "Greenland"
    , "GD": "Grenada"
    , "GP": "Guadeloupe"
    , "GU": "Guam"
    , "GT": "Guatemala"
    , "GG": "Guernsey"
    , "GN": "Guinea"
    , "GW": "Guinea-Bissau"
    , "GY": "Guyana"
    , "HT": "Haiti"
    , "HM": "Heard Island and McDonald Islands"
    , "HN": "Honduras"
    , "HK": "Hong Kong SAR China"
    , "HU": "Hungary"
    , "IS": "Iceland"
    , "IN": "India"
    , "ID": "Indonesia"
    , "IR": "Iran"
    , "IQ": "Iraq"
    , "IE": "Ireland"
    , "IM": "Isle of Man"
    , "IL": "Israel"
    , "IT": "Italy"
    , "JM": "Jamaica"
    , "JP": "Japan"
    , "JE": "Jersey"
    , "JO": "Jordan"
    , "KZ": "Kazakhstan"
    , "KE": "Kenya"
    , "KI": "Kiribati"
    , "KW": "Kuwait"
    , "KG": "Kyrgyzstan"
    , "LA": "Laos"
    , "419": "Latin America and the Caribbean"
    , "LV": "Latvia"
    , "LB": "Lebanon"
    , "LS": "Lesotho"
    , "LR": "Liberia"
    , "LY": "Libya"
    , "LI": "Liechtenstein"
    , "LT": "Lithuania"
    , "LU": "Luxembourg"
    , "MO": "Macau SAR China"
    , "MK": "Macedonia"
    , "MG": "Madagascar"
    , "MW": "Malawi"
    , "MY": "Malaysia"
    , "MV": "Maldives"
    , "ML": "Mali"
    , "MT": "Malta"
    , "MH": "Marshall Islands"
    , "MQ": "Martinique"
    , "MR": "Mauritania"
    , "MU": "Mauritius"
    , "YT": "Mayotte"
    , "44": "Melanesia"
    , "MX": "Mexico"
    , "FM": "Micronesia"
    , "47": "Micronesian Region"
    , "15": "Middle Africa"
    , "MD": "Moldova"
    , "MC": "Monaco"
    , "MN": "Mongolia"
    , "ME": "Montenegro"
    , "MS": "Montserrat"
    , "MA": "Morocco"
    , "MZ": "Mozambique"
    , "MM": "Myanmar [Burma]"
    , "NA": "Namibia"
    , "NR": "Nauru"
    , "NP": "Nepal"
    , "NL": "Netherlands"
    , "AN": "Netherlands Antilles"
    , "NC": "New Caledonia"
    , "NZ": "New Zealand"
    , "NI": "Nicaragua"
    , "NE": "Niger"
    , "NG": "Nigeria"
    , "NU": "Niue"
    , "NF": "Norfolk Island"
    , "KP": "North Korea"
    , "13": "Northern Africa"
    , "17": "Northern America"
    , "154": "Northern Europe"
    , "MP": "Northern Mariana Islands"
    , "NO": "Norway"
    , "0": "Oceania"
    , "OM": "Oman"
    , "QO": "Outlying Oceania"
    , "PK": "Pakistan"
    , "PW": "Palau"
    , "PS": "Palestinian Territories"
    , "PA": "Panama"
    , "PG": "Papua New Guinea"
    , "PY": "Paraguay"
    , "PE": "Peru"
    , "PH": "Philippines"
    , "PN": "Pitcairn Islands"
    , "PL": "Poland"
    , "49": "Polynesia"
    , "PT": "Portugal"
    , "PR": "Puerto Rico"
    , "QA": "Qatar"
    , "RO": "Romania"
    , "RU": "Russia"
    , "RW": "Rwanda"
    , "RE": "Réunion"
    , "BL": "Saint Barthélemy"
    , "SH": "Saint Helena"
    , "KN": "Saint Kitts and Nevis"
    , "LC": "Saint Lucia"
    , "MF": "Saint Martin"
    , "PM": "Saint Pierre and Miquelon"
    , "VC": "Saint Vincent and the Grenadines"
    , "WS": "Samoa"
    , "SM": "San Marino"
    , "SA": "Saudi Arabia"
    , "SN": "Senegal"
    , "RS": "Serbia"
    , "CS": "Serbia and Montenegro"
    , "SC": "Seychelles"
    , "SL": "Sierra Leone"
    , "SG": "Singapore"
    , "SK": "Slovakia"
    , "SI": "Slovenia"
    , "SB": "Solomon Islands"
    , "SO": "Somalia"
    , "ZA": "South Africa"
    , "5": "South America"
    , "GS": "South Georgia and the South Sandwich Islands"
    , "KR": "South Korea"
    , "50": "South-Central Asia"
    , "29": "South-Eastern Asia"
    , "28": "Southern Asia"
    , "3": "Southern Europe"
    , "ES": "Spain"
    , "LK": "Sri Lanka"
    , "SD": "Sudan"
    , "SR": "Suriname"
    , "SJ": "Svalbard and Jan Mayen"
    , "SZ": "Swaziland"
    , "SE": "Sweden"
    , "CH": "Switzerland"
    , "SY": "Syria"
    , "ST": "São Tomé and Príncipe"
    , "TW": "Taiwan"
    , "TJ": "Tajikistan"
    , "TZ": "Tanzania"
    , "TH": "Thailand"
    , "TL": "Timor-Leste"
    , "TG": "Togo"
    , "TK": "Tokelau"
    , "TO": "Tonga"
    , "TT": "Trinidad and Tobago"
    , "TN": "Tunisia"
    , "TR": "Turkey"
    , "TM": "Turkmenistan"
    , "TC": "Turks and Caicos Islands"
    , "TV": "Tuvalu"
    , "UM": "U.S. Minor Outlying Islands"
    , "VI": "U.S. Virgin Islands"
    , "UG": "Uganda"
    , "UA": "Ukraine"
    , "AE": "United Arab Emirates"
    , "GB": "United Kingdom"
    , "US": "United States"
    , "ZZ": "Unknown or Invalid Region"
    , "UY": "Uruguay"
    , "UZ": "Uzbekistan"
    , "VU": "Vanuatu"
    , "VA": "Vatican City"
    , "VE": "Venezuela"
    , "VN": "Vietnam"
    , "WF": "Wallis and Futuna"
    , "9": "Western Africa"
    , "145": "Western Asia"
    , "155": "Western Europe"
    , "EH": "Western Sahara"
    , "YE": "Yemen"
    , "ZM": "Zambia"
    , "ZW": "Zimbabwe"
    , "AX": "Åland Islands"
    }, defaultVal);
};
