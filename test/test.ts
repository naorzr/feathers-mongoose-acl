import {expect} from 'chai'
import {AND} from "../lib";
import {HookContext} from "@feathersjs/feathers";

describe('Declarative AND method testing', () => {
    it('should return a valid criteria object', () => {
        const fakeContext = {} as HookContext
        const condition1 = () => ({field: 'value1'})
        const condition2 = () => ({field2: 'value2'})
        const res = AND(condition1, condition2)(fakeContext)
        expect(res).to.deep.equals({$and: [condition1(),condition2()]})
    });
});