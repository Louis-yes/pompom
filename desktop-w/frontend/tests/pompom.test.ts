import {describe, expect, test} from '@jest/globals';
import {displayRounds, modes, end, pause, updateRounds, State, isValid, start, reset, percent} from "../src/pompom"

const eightRounds = [
    {name: "focus", duration: 25 },
    {name: "rest", duration: 5 },
    {name: "focus", duration: 25 },
    {name: "rest", duration: 5 },
    {name: "focus", duration: 25 },
    {name: "rest", duration: 5 },
    {name: "focus", duration: 25 },
    {name: "rest", duration: 5 },
]

const threeRounds = [
    {name: "focus", duration: 25 },
    {name: "rest", duration: 5 },
    {name: "rest", duration: 5 },
]

const mockState = function(opts: Partial<State>): State{
    const ds = {
        time: 0,
        mode: modes.ready,
        rounds: eightRounds,
        currentRound: 0,
    }
    return {...ds, ...opts}
}
describe('Pompom', () => {
    describe('Rendering', () => {
        test('should render round 3(4) of 8 as 2 pairs complete', () => {
            expect(displayRounds(3, eightRounds )).toBe("xxoo")
        });
        test('should render round 1(2) of 8 as 1 pair complete', () => {
            expect(displayRounds(1, eightRounds )).toBe("xooo")
        });
        test('should render round 1(2) of 3 as 1 pair complete', () => {
            expect(displayRounds(1, threeRounds )).toBe("xo")
        });
        test('should render round 2(3) of 3 as 2 pairs complete (last round is halfpair)', () => {
            expect(displayRounds(2, threeRounds )).toBe("xx")   
        });

        test('should render percentage complete correctly', () => {
            let ss = mockState({time: 12.5, rounds: threeRounds})
            expect(percent(ss)).toBe(50)
        })
    });

    test("ending final round should return the current round to 0", () => {
      const ss = mockState({currentRound: 2, rounds: threeRounds})
      expect(end(ss).currentRound).toBe(0)
    })

    describe('round updating', () => {
        test("CSV with bad line shouldn't be valid", () => {
            let rr = `
            round, 00, 00
            round, bad, 00
            round, 00, 00
            `
            expect(isValid(rr)).not.toBeTruthy()
        })

        test("updateRound should disregard blank lines", () => {
            const ss = mockState({rounds: threeRounds})
            const str = `
            round, 00, 00
            round, 00, 00
            round, 00, 00
            round, 00, 00
            round, 00, 00
            round, 00, 00
            round, 00, 00
            round, 00, 00
            `
            expect(updateRounds(str)(ss).rounds.length).toBe(8)
        })
    });

    describe("Basic Actions", () => {
        test("Start function should return state with mode as \"running\"", () => {
            let ss = mockState({});
            expect(start(ss).mode).toBe(modes.running)
        })
        test("End function should return state with mode as \"waiting\"", () => {
            let ss = mockState({});
            expect(end(ss).mode).toBe(modes.waiting)
        })
        test("Pause should return state with mode as \"paused\"", () => {
            let ss = mockState({});
            expect(pause(ss).mode).toBe(modes.paused)
        })

        test("Reset should return state with mode as \"ready\"", () => {
            let ss = mockState({});
            expect(reset(ss).mode).toBe(modes.ready)
        })

        test("Reset should return state with time as first round duration", () => {
            let ss = mockState({});
            expect(reset(ss).time).toBe(ss.rounds[0].duration)
        })

        test("Reset should return state with currentRound as 0", () => {
            let ss = mockState({});
            expect(reset(ss).currentRound).toBe(0)
        })

    })
});