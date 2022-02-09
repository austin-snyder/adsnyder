
// function implementation
function RodCalc(value_array, cost_per_cut) {
    var cut_cost = 3;

    document.getElementById("rod_input_1").innerHTML = "Rod length values: " + value_array;
    document.getElementById("rod_input_2").innerHTML = "Cost per cut: " + cost_per_cut;
    document.getElementById("rod_output").innerHTML = "Optimal: " + cutRod(value_array, cost_per_cut);
}

function cutRod(price, cut_cost)
{
    let n = price.length;
    let val = [...price];

    // CHANGE TO FIT PROBLEM
    let cost = cut_cost;

    // Build the table val[] in
    // bottom up manner and return
    // the last entry from the table
    for (let i = 1; i<n; i++) {
        for (let j = 0; j < i; j++) {
            val[i] = Math.max(val[i], val[j] + val[i - j - 1] - cost);
        }
    }

    return val;
}