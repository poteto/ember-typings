import RSVP from 'rsvp';
import { assertType } from '../ember/test/lib/assert';

async function testAsyncAwait() {
    const awaitedNothing = await RSVP.resolve();
    const awaitedValue = await RSVP.resolve('just a value');

    async function returnsAPromise(): RSVP.Promise<string> {
        return RSVP.resolve('look, a string');
    }

    assertType<RSVP.Promise<string>>(returnsAPromise());
    assertType<string>(await returnsAPromise());
}

function testPromise() {
    const promiseOfString = new RSVP.Promise((resolve: any, reject: any) => resolve('some string'));
    assertType<RSVP.Promise<number>>(promiseOfString.then((s: string) => s.length));
}

function testAll() {
    const empty = RSVP.Promise.all([]);

    const everyPromise = RSVP.all([
        'string',
        RSVP.resolve(42),
        RSVP.resolve({ hash: 'with values' }),
    ]);

    assertType<RSVP.Promise<[string, number, { hash: string }]>>(everyPromise);

    const anyFailure = RSVP.all([12, 'strings', RSVP.reject('anywhere')]);
    assertType<RSVP.Promise<{}>>(anyFailure);

    let promise1 = RSVP.resolve(1);
    let promise2 = RSVP.resolve('2');
    let promise3 = RSVP.resolve({ key: 13 });
    RSVP.Promise.all([promise1, promise2, promise3], 'my label').then(function(array) {
        assertType<number>(array[0]);
        assertType<string>(array[1]);
        assertType<{ key: number }>(array[2]);
    });
}

function testAllSettled() {
    const resolved1 = RSVP.resolve(1);
    const resolved2 = RSVP.resolve('wat');
    const rejected = RSVP.reject(new Error('oh teh noes'));
    const pending = new RSVP.Promise<{ neato: string }>((resolve, reject) => {
        if ('something') {
            resolve({ neato: 'yay' });
        } else {
            reject('nay');
        }
    });

    // Types flow into resolution properly
    RSVP.allSettled([resolved1, resolved2, rejected, pending]).then(states => {
        assertType<RSVP.PromiseState<number>>(states[0]);
        assertType<RSVP.PromiseState<string>>(states[1]);
        assertType<RSVP.PromiseState<never>>(states[2]);
        assertType<RSVP.PromiseState<{ neato: string }>>(states[3]);
    });

    // Switching on state gives the correctly available items.
    RSVP.allSettled([resolved1, resolved2, rejected, pending]).then(states => {
        states.forEach(element => {
            switch (element.state) {
                case RSVP.State.fulfilled:
                    console.log(element.value);
                    break;

                case RSVP.State.rejected:
                    console.log(element.reason);
                    break;

                case RSVP.State.pending:
                    // Nothing to see here: pending has nothing going!
                    break;

                default:
                    // Someday maybe TS will have exhaustiveness checks.
                    break;
            }
        });
    });
}

function testDefer() {
    let deferred = RSVP.defer<string>();
    deferred.resolve("Success!");
    deferred.promise.then(function(value){
        assertType<string>(value);
    });
}

function testDenodeify() {
    // TODO: add test
}

function testFilter() {
    // TODO: add test
}

function testHash() {
    let promises = {
        myPromise: RSVP.resolve(1),
        yourPromise: RSVP.resolve('2'),
        theirPromise: RSVP.resolve({ key: 3 }),
        notAPromise: 4,
    };
    RSVP.hash(promises, 'my label').then(function(hash) {
        assertType<number>(hash.myPromise);
        assertType<string>(hash.yourPromise);
        assertType<{ key: number }>(hash.theirPromise);
        assertType<number>(hash.notAPromise);
    });
}

function testHashSettled() {
    function isFulfilled<T>(state: RSVP.PromiseState<T>): state is RSVP.Resolved<T> {
        return state.state === RSVP.State.fulfilled;
    }
    let promises = {
        myPromise: RSVP.Promise.resolve(1),
        yourPromise: RSVP.Promise.resolve('2'),
        theirPromise: RSVP.Promise.resolve({ key: 3 }),
        notAPromise: 4
    };
    RSVP.hashSettled(promises).then(function(hash){
        if (isFulfilled(hash.myPromise)) {
            assertType<number>(hash.myPromise.value);
        }
        if (isFulfilled(hash.yourPromise)) {
            assertType<string>(hash.yourPromise.value);
        }
        if (isFulfilled(hash.theirPromise)) {
            assertType<{ key: number }>(hash.theirPromise.value);
        }
        if (isFulfilled(hash.notAPromise)) {
            assertType<number>(hash.notAPromise.value);
        }
    });
}

function testMap() {
    // TODO: add test
}

function testRace() {
    const firstPromise = RSVP.race([{ notAPromise: true }, RSVP.resolve({ some: 'value' })]);
    assertType<RSVP.Promise<{ notAPromise: boolean } | { some: string }>>(firstPromise);

    let promise1 = RSVP.resolve(1);
    let promise2 = RSVP.resolve('2');
    RSVP.Promise.race([promise1, promise2], 'my label').then(function(result) {
        assertType<string | number>(result);
    });
}

function testReject() {
    assertType<RSVP.Promise<never>>(RSVP.reject());
    assertType<RSVP.Promise<never>>(RSVP.reject('this is a string'));

    RSVP.reject({ ok: false }).catch(reason => {
        console.log(`${reason} could be anything`);
    });
    RSVP.reject({ ok: false }, 'some label').catch((reason: any) => reason.ok);

    let promise = RSVP.Promise.reject(new Error('WHOOPS'));
}

function testResolve() {
    assertType<RSVP.Promise<void>>(RSVP.resolve());
    assertType<RSVP.Promise<string>>(RSVP.resolve('this is a string'));
    assertType<RSVP.Promise<string>>(RSVP.resolve(RSVP.resolve('nested')));
    assertType<RSVP.Promise<string>>(RSVP.resolve(Promise.resolve('nested')));

    let promise = RSVP.Promise.resolve(1);
}

function testRethrow() {
    // TODO: add test
}

function testOnAndOff() {
    RSVP.on('error', (reason: Error) => {
        console.log(`it was an error: ${reason}`);
    });

    RSVP.off('whatever', (value: any) => {
        console.log(
            `any old value will do: ${value !== undefined && value !== null
                ? value.toString()
                : 'even undefined'}`
        );
    });
}
