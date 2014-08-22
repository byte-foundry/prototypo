points[0](width * 400 / 2, xHeight);
points[1](width * 400, xHeight / 2);
points[2](width * 400 / 2, 0);
points[3](0, xHeight / 2);

skeletons[0](
	{c: points[0], width: thickness * contrast, angle: 90, distr: 1, tension: roundness},
	{c: points[1], width: thickness, angle: 0, distr: 1},
	{c: points[2], width: thickness * contrast, angle: -90, distr: 1, tension: roundness},
	{c: points[3], width: thickness, angle: -180, distr: 1},
	'cycle'
);