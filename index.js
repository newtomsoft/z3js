const SudokuSolver = require('./SudokuSolver');

// Example Sudoku puzzle (0 represents empty cells)
const puzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

async function main() {
    try {
        console.log('Original Puzzle:');
        const solver = await SudokuSolver.create(puzzle);
        solver.printPuzzle();
        console.log('\nSolving...');
        await solver.solveSudoku();
        console.log('\nSolution:');
        solver.printSolution();
    } catch (error) {
        console.error('Error:', error);
    }
}

main().then(() => console.log('Completed')).catch(err => console.error(err));
