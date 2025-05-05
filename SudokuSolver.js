const { init } = require('z3-solver');

class SudokuSolver {
    // Constants
    static GridSize = 9;
    static BlockSize = 3;
    static MinValue = 1;
    static MaxValue = SudokuSolver.GridSize;

    constructor(puzzle, ctx, solver, z3) {
        this._puzzle = puzzle;
        this._ctx = ctx;
        this._solver = solver;
        this._matrixExpr = Array.from({length: SudokuSolver.GridSize}, () => Array(SudokuSolver.GridSize).fill(null));
        this._solution = Array.from({length: SudokuSolver.GridSize}, () => Array(SudokuSolver.GridSize).fill(0));
    }

    static async create(puzzle) {
        const z3 = await init();
        const ctx = new z3.Context();
        const solver = new ctx.Solver();
        return new SudokuSolver(puzzle, ctx, solver, z3);
    }

    async solveSudoku() {
        this.setInitialPuzzleValues();
        this.addValueRangeConstraints();
        this.addDistinctRowConstraint();
        this.addDistinctColumnConstraint();
        this.addDistinctBlockConstraints();
        await this.evaluateSolverAndExtractSolution();
        return this._solution;
    }

    async evaluateSolverAndExtractSolution() {
        const status = await this._solver.check();
        if (status !== 'sat') return;
        const model = await this._solver.model();

        for (let i = 0; i < SudokuSolver.GridSize; i++) {
            for (let j = 0; j < SudokuSolver.GridSize; j++) {
                const value = await model.eval(this._matrixExpr[i][j]);
                this._solution[i][j] = parseInt(value.toString());
            }
        }
    }

    setInitialPuzzleValues() {
        for (let i = 0; i < SudokuSolver.GridSize; i++) {
            for (let j = 0; j < SudokuSolver.GridSize; j++) {
                this._matrixExpr[i][j] = this._ctx.Int.const(`cell_${i}_${j}`);
            }
        }

        for (let i = 0; i < SudokuSolver.GridSize; i++) {
            for (let j = 0; j < SudokuSolver.GridSize; j++) {
                if (this._puzzle[i][j] !== 0) {
                    this._solver.add(
                        this._matrixExpr[i][j].eq(this._puzzle[i][j])
                    );
                }
            }
        }
    }

    addValueRangeConstraints() {
        for (const row of this._matrixExpr) {
            for (const cellExpr of row) {
                const minConstraint = cellExpr.ge(SudokuSolver.MinValue);
                const maxConstraint = cellExpr.le(SudokuSolver.MaxValue);
                this._solver.add(minConstraint, maxConstraint);
            }
        }
    }

    addDistinctRowConstraint() {
        for (let rowIndex = 0; rowIndex < SudokuSolver.GridSize; rowIndex++) {
            const rowValues = this._matrixExpr[rowIndex];
            // Add pairwise not-equal constraints instead of using Distinct
            for (let i = 0; i < rowValues.length; i++) {
                for (let j = i + 1; j < rowValues.length; j++) {
                    this._solver.add(rowValues[i].neq(rowValues[j]));
                }
            }
        }
    }

    addDistinctColumnConstraint() {
        for (let columnIndex = 0; columnIndex < SudokuSolver.GridSize; columnIndex++) {
            const columnValues = Array.from({length: SudokuSolver.GridSize}, (_, rowIndex) => this._matrixExpr[rowIndex][columnIndex]);
            // Add pairwise not-equal constraints instead of using Distinct
            for (let i = 0; i < columnValues.length; i++) {
                for (let j = i + 1; j < columnValues.length; j++) {
                    this._solver.add(columnValues[i].neq(columnValues[j]));
                }
            }
        }
    }

    addDistinctBlockConstraints() {
        for (let blockRow = 0; blockRow < SudokuSolver.BlockSize; blockRow++) {
            for (let blockCol = 0; blockCol < SudokuSolver.BlockSize; blockCol++) {
                const blockValues = [];
                for (let i = 0; i < SudokuSolver.BlockSize; i++) {
                    for (let j = 0; j < SudokuSolver.BlockSize; j++) {
                        blockValues.push(this._matrixExpr[blockRow * 3 + i][blockCol * 3 + j]);
                    }
                }
                // Add pairwise not-equal constraints instead of using Distinct
                for (let i = 0; i < blockValues.length; i++) {
                    for (let j = i + 1; j < blockValues.length; j++) {
                        this._solver.add(blockValues[i].neq(blockValues[j]));
                    }
                }
            }
        }
    }

    printPuzzle() {
        SudokuSolver.printMatrix(this._puzzle);
    }

    printSolution() {
        SudokuSolver.printMatrix(this._solution);
    }

    static printMatrix(matrix) {
        for (let i = 0; i < SudokuSolver.GridSize; i++) {
            if (i % SudokuSolver.BlockSize === 0 && i !== 0) console.log("------+-------+------");
            const rowParts = [];
            for (let j = 0; j < SudokuSolver.GridSize; j++) {
                if (j % SudokuSolver.BlockSize === 0 && j !== 0) rowParts.push("| ");
                const value = matrix[i][j];
                rowParts.push(value === 0 ? ". " : value + " ");
            }
            console.log(rowParts.join(""));
        }
    }
}

module.exports = SudokuSolver;