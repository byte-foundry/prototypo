/*points[0](0,0);
points[1](width * 400, 0);
points[2](points[1].x / 2, xHeight);
points[3](points(1).x / 5, points(2).y / 2);

skeletons[0](
	{c: points[0], width: thickness * contrast},
	{c: points[3], width: thickness * contrast, angle: 10 },
	{c: points[2], width: thickness * contrast * 0.8, angle: -90, distr: 0},
	'line',
	{c: points[1], width: thickness * contrast, angle: -180}
);*/

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