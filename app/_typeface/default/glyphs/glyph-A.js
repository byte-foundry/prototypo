points[0](0,0);
points[1](width * 400, 0);
points[2](points[1].x / 2, xHeight);
points[3](10,20);

skeletons[0](
	{c: points[0]},
	{c: points[2]},
	{c: points[1]}
);