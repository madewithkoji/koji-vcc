const broadcast = ({ scope, key, value }) => {

  window.postMessage({
        action: 'injectGlobal',
        payload: { scope, key, value }
  }, "*");
};

const testText = (test) => {
    broadcast({
        ...test,
        ...{
            value: 'hello koji'
        }
    });
};

const testColor = (test) => {
    // random color: http://disq.us/p/1mvpsb4
    broadcast({
        ...test,
        ...{
            value: `#${(Math.random()*(1<<24)|0).toString(16)}`
        }
    });
};

const testImage = (test) => {
    broadcast({
        ...test,
        ...{
            value: `https://placeimg.com/640/480/any`
        }
    });
};

const testSound = (test) => {
    let sound = 'https://ia800304.us.archive.org/25/items/ird059/tcp_d3_02_iran_iraq_jamming_efficacy_testting_irdial.mp3';
    broadcast({
        ...test,
        ...{
            value: sound
        }
    });
};

const testFont = (test) => {
    broadcast({
        ...test,
        ...{
            value: 'Indie Flower'
        }
    });
};

const testBoolean = (test) => {
    broadcast({
        ...test,
        ...{
            value: !test.value
        }
    });
};


const testField = ({ scopeKey, key, value, type }) => {

    const testTypes = {
        text: testText,
        textarea: testText,
        color: testColor,
        image: testImage,
        sound: testSound,
        boolean: testBoolean,
        font: testFont
    };

    if (!type) {
        return console.error('Missing type', scopeKey, key);
    }

    if (!testTypes[type]) {
        return console.error('Invalid type', type, scopeKey, key);
    }

    return testTypes[type]({ scope: scopeKey, key, value });
}

const testScope = (scope, values) => {
    scope.fields
    .forEach(field => {
        testField({
            scopeKey: scope.key,
            key: field.key,
            value: values[field.key],
            type: field.type
        });
    });
};

const testConfig = (config) => {
    if (!config || !config['@@editor']) {
        return console.error(`${config} not a valid config`);
    }

    window.vccTest = () => {
        // test vccs
        config['@@editor']
        .forEach(scope => {
            testScope(scope, config[scope.key]);
        });
    };
};

module.exports = testConfig;
