import { CaseField } from '../../../domain/definition/case-field.model';
import { IsCompoundPipe } from './is-compound.pipe';

describe('IsCompoundPipe', () => {

  const isCompound: IsCompoundPipe = new IsCompoundPipe();

  it('should identify null field as NOT compound', () => {
    expect(isCompound.transform(null))
      .toBeFalsy();
  });

  it('should identify undefined field_type as NOT compound', () => {
    expect(isCompound.transform({} as CaseField))
      .toBeFalsy();
  });

  it('should identify undefined field_type.type as NOT compound', () => {
    expect(isCompound.transform({ field_type: { }} as CaseField))
      .toBeFalsy();
  });

  it('should identify Text field as NOT compound', () => {
    expect(isCompound.transform({ field_type: { type: 'Text' }} as CaseField))
      .toBeFalsy();
  });

  it('should identify Complex field as compound', () => {
    expect(isCompound.transform({ field_type: { type: 'Complex' }} as CaseField))
      .toBeTruthy();
  });

  it('should identify Label fields as compound', () => {
    expect(isCompound.transform({ field_type: { type: 'Label' }} as CaseField))
      .toBeTruthy();
  });

  it('should identify AddressGlobal fields as compound', () => {
    expect(isCompound.transform({ field_type: { type: 'AddressGlobal' }} as CaseField))
      .toBeTruthy();
  });

  it('should identify Complex fields and CaseLink id as NOT compound', () => {
    expect(isCompound.transform({ field_type: { type: 'Complex', id: 'CaseLink' }} as CaseField))
      .toBeFalsy();
  });

  it('should identify Complex fields and JudicialUser as NOT compound', () => {
    expect(isCompound.transform({ field_type: { type: 'Complex', id: 'JudicialUser' }} as CaseField))
      .toBeFalsy();
  });

});
