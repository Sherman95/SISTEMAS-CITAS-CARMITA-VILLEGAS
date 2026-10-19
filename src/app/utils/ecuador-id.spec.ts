import { normalizeDocumento, validateEcuadorDocument } from './ecuador-id';

describe('validateEcuadorDocument', () => {
  it('acepta cédulas con distintos códigos provinciales incluido 30 (exterior)', () => {
    for (const cedula of ['0122345671', '0934567892', '1700340654', '1710034065', '2451234567', '3012345652']) {
      const result = validateEcuadorDocument(cedula);
      expect(result.valid).withContext(cedula).toBe(true);
      expect(result.type).toBe('CEDULA');
    }
  });

  it('rechaza cédulas con dígito verificador incorrecto o provincia inválida', () => {
    expect(validateEcuadorDocument('1234567890').valid).toBe(false);
    expect(validateEcuadorDocument('1710034066').valid).toBe(false);
    expect(validateEcuadorDocument('2522345671').valid).toBe(false);
    expect(validateEcuadorDocument('9922345671').valid).toBe(false);
  });

  it('rechaza cédulas con tercer dígito mayor a 5', () => {
    expect(validateEcuadorDocument('1782345670').valid).toBe(false);
  });

  it('valida RUC natural con checksum estricto', () => {
    const result = validateEcuadorDocument('1710034065001');
    expect(result.valid).toBe(true);
    expect(result.type).toBe('RUC_NATURAL');
    expect(result.checksum_valid).toBe(true);
  });

  it('acepta RUC jurídico y público aunque fallen el algoritmo antiguo del SRI', () => {
    const juridico = validateEcuadorDocument('1790012344001');
    expect(juridico.valid).toBe(true);
    expect(juridico.type).toBe('RUC_JURIDICO');

    const publico = validateEcuadorDocument('1760001550001');
    expect(publico.valid).toBe(true);
    expect(publico.type).toBe('RUC_PUBLICO');

    const juridicoAlgoritmoAntiguo = validateEcuadorDocument('1790012349001');
    expect(juridicoAlgoritmoAntiguo.valid).toBe(true);
    expect(juridicoAlgoritmoAntiguo.checksum_valid).toBe(false);
  });

  it('distingue formato válido, validación algorítmica y verificación oficial no realizada', () => {
    const cedula = validateEcuadorDocument('1710034065');
    expect(cedula.verification_level).toBe('algorithmic');
    expect(cedula.official_verification).toBe('not_performed');

    const juridicoConChecksum = validateEcuadorDocument('1790012344001');
    expect(juridicoConChecksum.checksum_valid).toBe(true);
    expect(juridicoConChecksum.verification_level).toBe('algorithmic');

    const juridicoSinChecksum = validateEcuadorDocument('1790012349001');
    expect(juridicoSinChecksum.valid).toBe(true);
    expect(juridicoSinChecksum.verification_level).toBe('structure_only');
    expect(juridicoSinChecksum.official_verification).toBe('not_performed');

    const invalido = validateEcuadorDocument('1234567890');
    expect(invalido.verification_level).toBeNull();
    expect(invalido.official_verification).toBe('not_performed');
  });

  it('rechaza longitudes no soportadas', () => {
    expect(validateEcuadorDocument('171003406').valid).toBe(false);
    expect(validateEcuadorDocument('17100340651').valid).toBe(false);
    expect(validateEcuadorDocument('').valid).toBe(false);
  });

  it('normaliza el documento conservando ceros iniciales', () => {
    expect(normalizeDocumento(' 0122345671 ')).toBe('0122345671');
    expect(validateEcuadorDocument('0122345671').normalized).toBe('0122345671');
  });
});
