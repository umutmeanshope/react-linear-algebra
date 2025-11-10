import { useState } from 'react';
import { Calculator, Shuffle, RotateCw, Grid3x3, Divide, Layers } from 'lucide-react';

type Matrix = number[][];
type Vector = number[];

export default function MatrixCalculator() {
  const [activeTab, setActiveTab] = useState<'matrix' | 'vector'>('matrix');
  const [size, setSize] = useState<number>(3);
  const [matrix, setMatrix] = useState<Matrix>(() =>
    Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => 0))
  );
  const [result, setResult] = useState<number | Matrix | 'singular' | null>(null);
  const [operation, setOperation] = useState<string>('');

  // Vector states
  const [vector1, setVector1] = useState<Vector>([0, 0, 0]);
  const [vector2, setVector2] = useState<Vector>([0, 0, 0]);
  const [vectorResult, setVectorResult] = useState<number | Vector | null>(null);
  const [vectorOperation, setVectorOperation] = useState<string>('');
  const [dotResult, setDotResult] = useState<number | null>(null);
  const [crossResult, setCrossResult] = useState<Vector | null>(null);

  const handleSizeChange = (newSize: number): void => {
    setSize(newSize);
    setMatrix(Array.from({ length: newSize }, () => Array.from({ length: newSize }, () => 0)));
    setResult(null);
    setOperation('');
  };

  const handleCellChange = (i: number, j: number, value: string): void => {
    const newMatrix = matrix.map(row => [...row]);
    newMatrix[i][j] = parseFloat(value) || 0;
    setMatrix(newMatrix);
  };

  const handleVectorChange = (vectorNum: 1 | 2, index: number, value: string): void => {
    if (vectorNum === 1) {
      const newVector = [...vector1];
      newVector[index] = parseFloat(value) || 0;
      setVector1(newVector);
    } else {
      const newVector = [...vector2];
      newVector[index] = parseFloat(value) || 0;
      setVector2(newVector);
    }
  };

  const generateRandomMatrix = (): void => {
    const newMatrix = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Math.floor(Math.random() * 21) - 10)
    );

    // Ensure at least one element is zero
    const randomRow = Math.floor(Math.random() * size);
    const randomCol = Math.floor(Math.random() * size);
    newMatrix[randomRow][randomCol] = 0;

    setMatrix(newMatrix);
    setResult(null);
    setOperation('');
  };

  const generateRandomVectors = (): void => {
    setVector1(Array.from({ length: 3 }, () => Math.floor(Math.random() * 21) - 10));
    setVector2(Array.from({ length: 3 }, () => Math.floor(Math.random() * 21) - 10));
    setVectorResult(null);
    setVectorOperation('');
    setDotResult(null);
    setCrossResult(null);
  };

  const calculateDeterminant = (mat: Matrix): number => {
    const n = mat.length;
    if (n === 1) return mat[0][0];
    if (n === 2) return mat[0][0] * mat[1][1] - mat[0][1] * mat[1][0];

    let det = 0;
    for (let j = 0; j < n; j++) {
      const minor = mat.slice(1).map(row => row.filter((_, idx) => idx !== j));
      det += mat[0][j] * calculateDeterminant(minor) * (j % 2 === 0 ? 1 : -1);
    }
    return det;
  };

  const transposeMatrix = (mat: Matrix): Matrix => {
    return mat[0].map((_, i) => mat.map(row => row[i]));
  };

  const getCofactor = (mat: Matrix, row: number, col: number): number => {
    const minor = mat.filter((_, i) => i !== row).map(r => r.filter((_, j) => j !== col));
    const det = calculateDeterminant(minor);
    return det * ((row + col) % 2 === 0 ? 1 : -1);
  };

  const calculateAdjoint = (mat: Matrix): Matrix => {
    const n = mat.length;
    if (n === 1) return [[1]];

    const cofactorMatrix: Matrix = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        cofactorMatrix[i][j] = getCofactor(mat, i, j);
      }
    }
    return transposeMatrix(cofactorMatrix);
  };

  const calculateInverse = (mat: Matrix): Matrix | null => {
    const det = calculateDeterminant(mat);
    if (Math.abs(det) < 1e-10) {
      return null;
    }

    const adj = calculateAdjoint(mat);
    return adj.map(row => row.map(val => val / det));
  };

  const handleCalculate = (op: 'determinant' | 'transpose' | 'adjoint' | 'inverse'): void => {
    setOperation(op);

    switch (op) {
      case 'determinant': {
        const det = calculateDeterminant(matrix);
        setResult(det);
        break;
      }
      case 'transpose':
        setResult(transposeMatrix(matrix));
        break;
      case 'adjoint':
        setResult(calculateAdjoint(matrix));
        break;
      case 'inverse': {
        const inv = calculateInverse(matrix);
        if (inv === null) {
          setResult('singular');
        } else {
          setResult(inv);
        }
        break;
      }
      default:
        break;
    }
  };

  // Vector operations
  const dotProduct = (v1: Vector, v2: Vector): number => {
    const res = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
    return res;
  };

  const crossProduct = (v1: Vector, v2: Vector): Vector => {
    const res: Vector = [
      v1[1] * v2[2] - v1[2] * v2[1],
      v1[2] * v2[0] - v1[0] * v2[2],
      v1[0] * v2[1] - v1[1] * v2[0],
    ];
    return res;
  };

  const cosCalculate = (v1: Vector, v2: Vector): number => {
    const dot = dotProduct(v1, v2);
    const mag1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2 + v1[2] ** 2);
    const mag2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2 + v2[2] ** 2);
    const result = mag1 === 0 || mag2 === 0 ? 0 : dot / (mag1 * mag2);
    return result;
  };

  const sinCalculate = (v1: Vector, v2: Vector): number => {
    const cross = crossProduct(v1, v2);
    const crossMag = Math.sqrt(cross[0] ** 2 + cross[1] ** 2 + cross[2] ** 2);
    const mag1 = Math.sqrt(v1[0] ** 2 + v1[1] ** 2 + v1[2] ** 2);
    const mag2 = Math.sqrt(v2[0] ** 2 + v2[1] ** 2 + v2[2] ** 2);
    const result = mag1 === 0 || mag2 === 0 ? 0 : crossMag / (mag1 * mag2);
    return result;
  };

  const handleVectorCalculate = (op: 'dot' | 'cross' | 'cos' | 'sin'): void => {
    setVectorOperation(op);

    switch (op) {
      case 'dot':
        setVectorResult(dotProduct(vector1, vector2));
        break;
      case 'cross':
        setVectorResult(crossProduct(vector1, vector2));
        break;
      case 'cos':
        setVectorResult(cosCalculate(vector1, vector2));
        break;
      case 'sin':
        setVectorResult(sinCalculate(vector1, vector2));
        break;
      default:
        break;
    }
  };

  const clearMatrix = (): void => {
    setMatrix(Array.from({ length: size }, () => Array.from({ length: size }, () => 0)));
    setResult(null);
    setOperation('');
  };

  const clearVectors = (): void => {
    setVector1([0, 0, 0]);
    setVector2([0, 0, 0]);
    setVectorResult(null);
    setVectorOperation('');
    setDotResult(null);
    setCrossResult(null);
  };

  const renderMatrix = (mat: Matrix, isResult = false) => (
    <div className="inline-block">
      <div className="flex flex-col gap-1 p-4 bg-white rounded-lg border-2 border-gray-300">
        {mat.map((row, i) => (
          <div key={i} className="flex gap-1">
            {row.map((cell, j) =>
              isResult ? (
                <div
                  key={j}
                  className="w-20 h-12 flex items-center justify-center rounded border text-sm font-mono bg-blue-50 border-blue-200 text-black"
                >
                  {typeof cell === 'number' ? cell.toFixed(3) : (cell as any)}
                </div>
              ) : (
                <input
                  key={j}
                  type="number"
                  value={cell}
                  onChange={(e) => handleCellChange(i, j, e.target.value)}
                  step="any"
                  className="w-20 h-12 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono text-black"
                />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderVector = (vec: Vector | (number | string)[], isResult = false, vectorNum?: 1 | 2) => (
    <div className="inline-block">
      <div className="flex flex-col gap-1 p-4 bg-white rounded-lg border-2 border-gray-300">
        {vec.map((val, i) => (
          <div key={i}>
            {isResult ? (
              <div className="w-24 h-12 flex items-center justify-center rounded border text-sm font-mono bg-purple-50 border-purple-200 text-black">
                {typeof val === 'number' ? val.toFixed(3) : (val as any)}
              </div>
            ) : (
              <input
                type="number"
                value={String(val)}
                onChange={(e) => handleVectorChange(vectorNum ?? 1, i, e.target.value)}
                step="any"
                className="w-24 h-12 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono text-black"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const getOperationName = (): string => {
    switch (operation) {
      case 'determinant':
        return 'Determinant';
      case 'transpose':
        return 'Transpose';
      case 'adjoint':
        return 'Adjoint Matrix (Ek Matris)';
      case 'inverse':
        return 'Inverse Matrix';
      default:
        return '';
    }
  };

  const getVectorOperationName = (): string => {
    switch (vectorOperation) {
      case 'dot':
        return 'Dot Product';
      case 'cross':
        return 'Cross Product';
      case 'cos':
        return `Cos θ`;
      case 'sin':
        return `Sin θ`;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Matrix & Vector Calculator</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'matrix'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid3x3 className="w-5 h-5" />
                Matrix Operations
              </div>
            </button>
            <button
              onClick={() => setActiveTab('vector')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'vector'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Vector Operations
              </div>
            </button>
          </div>

          {/* Matrix Tab */}
          {activeTab === 'matrix' && (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matrix Size: {size}×{size}
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleSizeChange(n)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        size === n ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {n}×{n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 flex gap-3">
                <button
                  onClick={generateRandomMatrix}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Shuffle className="w-5 h-5" />
                  Generate Random
                </button>
                <button
                  onClick={clearMatrix}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Clear Matrix
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Input Matrix</h2>
                {renderMatrix(matrix)}
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Operations</h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleCalculate('determinant')}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Calculator className="w-5 h-5" />
                    Determinant
                  </button>
                  <button
                    onClick={() => handleCalculate('transpose')}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <RotateCw className="w-5 h-5" />
                    Transpose
                  </button>
                  <button
                    onClick={() => handleCalculate('adjoint')}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    <Grid3x3 className="w-5 h-5" />
                    Adjoint (Ek)
                  </button>
                  <button
                    onClick={() => handleCalculate('inverse')}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    <Divide className="w-5 h-5" />
                    Inverse
                  </button>
                </div>
              </div>

              {result !== null && (
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">Result: {getOperationName()}</h2>
                  {operation === 'determinant' ? (
                    <div className="text-3xl font-bold text-blue-600">
                      det(A) = {typeof result === 'number' ? result.toFixed(4) : result}
                    </div>
                  ) : result === 'singular' ? (
                    <div className="text-xl font-semibold text-red-600">
                      Matrix is singular (determinant = 0). Inverse does not exist.
                    </div>
                  ) : (
                    renderMatrix(result as Matrix, true)
                  )}
                </div>
              )}
            </div>
          )}

          {/* Vector Tab */}
          {activeTab === 'vector' && (
            <div>
              <div className="mb-6 flex gap-3">
                <button
                  onClick={generateRandomVectors}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <Shuffle className="w-5 h-5" />
                  Generate Random
                </button>
                <button
                  onClick={clearVectors}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Clear Vectors
                </button>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Input Vectors</h2>
                <div className="flex gap-8 items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">Vector 1</p>
                    {renderVector(vector1, false, 1)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2 font-medium">Vector 2</p>
                    {renderVector(vector2, false, 2)}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Operations</h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleVectorCalculate('dot')}
                    className="flex cursor-pointer items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Dot Product (v1 · v2)
                  </button>
                  <button
                    onClick={() => handleVectorCalculate('cos')}
                    disabled={false}
                    className="flex cursor-pointer items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Cos θ
                  </button>
                  <button
                    onClick={() => handleVectorCalculate('cross')}
                    className="flex cursor-pointer items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Cross Product (v1 × v2)
                  </button>
                  <button
                    onClick={() => handleVectorCalculate('sin')}
                    disabled={false}
                    className="flex cursor-pointer items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                  >
                    Sin θ
                  </button>
                </div>
              </div>

              {vectorResult !== null && (
                <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">Result: {getVectorOperationName()}</h2>
                  {vectorOperation === 'dot' || vectorOperation === 'cos' || vectorOperation === 'sin' ? (
                    <div className="text-3xl font-bold text-purple-600">
                      {typeof vectorResult === 'number' ? vectorResult.toFixed(4) : String(vectorResult)}
                    </div>
                  ) : (
                    renderVector(vectorResult as Vector, true)
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}