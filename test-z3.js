const { init } = require('z3-solver');

async function testZ3() {
    try {
        console.log('Initializing Z3...');
        const z3 = await init();
        console.log('Z3 initialized');

        // Log available properties and methods
        console.log('Z3 properties:', Object.keys(z3));

        // Create a context
        const ctx = new z3.Context();
        console.log('Context created');

        // Check if z3 has a Solver property
        console.log('Does z3 have Solver?', 'Solver' in z3);

        // Check if ctx has a Solver property
        console.log('Does ctx have Solver?', 'Solver' in ctx);

        // Try to access the Solver constructor directly
        console.log('Trying to access z3.Z3.Solver...');
        if (z3.Z3 && z3.Z3.Solver) {
            console.log('z3.Z3.Solver exists');
            const solver = new z3.Z3.Solver(ctx);
            console.log('Solver created:', solver);
        } else {
            console.log('z3.Z3.Solver does not exist');
        }

        // Try to create a simple constraint and solve it
        console.log('Creating a simple constraint...');
        const x = ctx.Int.const('x');
        const y = ctx.Int.const('y');
        const z = ctx.Int.const('z');
        const constraint1 = x.gt(10);
        const constraint2 = y.gt(5);
        const constraint3 = z.gt(0);
        console.log('Constraint created:', constraint1.toString());

        // Try to use pairwise not-equal constraints instead of Distinct
        console.log('Creating pairwise not-equal constraints...');
        const notEqualXY = x.neq(y);
        const notEqualXZ = x.neq(z);
        const notEqualYZ = y.neq(z);
        console.log('Not equal constraints created:');
        console.log('x != y:', notEqualXY.toString());
        console.log('x != z:', notEqualXZ.toString());
        console.log('y != z:', notEqualYZ.toString());

        // Try to create a solver using new ctx.Solver()
        console.log('Creating solver using new ctx.Solver()...');
        const solver = new ctx.Solver();
        solver.add(constraint1);
        solver.add(constraint2);
        solver.add(constraint3);
        solver.add(notEqualXY);
        solver.add(notEqualXZ);
        solver.add(notEqualYZ);
        console.log('Checking satisfiability...');
        const result = await solver.check();
        console.log('Result:', result);

        if (result === 'sat') {
            const model = await solver.model();
            console.log('Model:', model.toString());
            console.log('x =', model.eval(x).toString());
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

testZ3();
