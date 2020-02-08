(function(){
    'use strict';

    /*********************************************************
        Notes about the physics in the simulations:
        The balls are equally hard (and have equal weight), so they don't lose energy when bouncing between themself.
        In the horizontal simulation, a ball loses energy when bouncing from a wall (the wall is harder and stationary).
        The ball also loses energy from the air and gravity in vertical simulation
        (but not from spinning and some other 3d things possible in billiard and basketball).
    *********************************************************/

    /**************
     * Ball class *
    ***************/
    function Ball(position, velocity, radius, localDimensions) {
        // base constructor
        this.position = position;
        this.velocity = velocity;
        this.radius = radius;
        this._localDimensions = localDimensions;
    }

    Ball.prototype.collision = function(ball) {
        const minDistance = ball.radius + this.radius;
        const position_diff = this.position.sub(ball.position);
        const distance = position_diff.length();

        if (distance <= minDistance) {
            /*********************************************************
                The formula could be found here: https://en.wikipedia.org/wiki/Elastic_collision
                velocityA -= (dot(velocityAB_diff, positionAB_diff) / distance^2) * positionAB_diff
                velocityB -= (dot(velocityBA_diff, positionBA_diff) / distance^2) * positionBA_diff
                but this thing (dot(velocityAB_diff, positionAB_diff) / distance^2) is same for 2 velocities
                because dot and length methods are commutative properties, and velocityAB_diff = -velocityBA_diff, same for position_diff
            *********************************************************/
            const coeff = this.velocity.sub(ball.velocity).dot(position_diff) / (distance * distance);
            this.velocity = this.velocity.sub(position_diff.mult(coeff));
            ball.velocity = ball.velocity.sub(position_diff.opposite().mult(coeff));

            // move balls outside of collision
            const diff = (minDistance - distance) / 2;
            this.position = this.position.add(this.velocity.tryNormalize().mult(diff));
            ball.position = ball.position.add(ball.velocity.tryNormalize().mult(diff));
        }
    }

    /************************
     * HorizontalBall class *
    *************************/
    const horizontalMovementProperties = {
        airResistance: 0.99, // decreasing of speed in each frame
        hitResistance: 0.8, // decreasing of speed when hit a wall
        speedFactor: 0.2 // speed factor
    };

    function HorizontalBall(position, velocity, radius, localDimensions) {
        // HorizontalBall constructor
        // call the base constructor
        Ball.call(this, position, velocity.mult(horizontalMovementProperties.speedFactor), radius, localDimensions);
    }

    HorizontalBall.prototype.collision = function(ball) {
        // call the base collision method
        Ball.prototype.collision.call(this, ball);
    }

    HorizontalBall.prototype.update = function() {
        var rightMostPoint = this._localDimensions.width - this.radius;
        var lowestPoint = this._localDimensions.height - this.radius;

        if (this.velocity.isNearZero())
            return; // the ball is staying in place

        this.position = this.position.add(this.velocity);

        if (this.position.X <= this.radius || this.position.X >= rightMostPoint) {
            // move ball inside the borders
            this.position.X = (this.position.X <= this.radius) ? this.radius : rightMostPoint;

            // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is Y axis)
            this.velocity.X = -this.velocity.X;
            this.velocity = this.velocity.mult(horizontalMovementProperties.hitResistance);
        }
        if (this.position.Y <= this.radius || this.position.Y >= lowestPoint) {
            // move ball inside the borders
            this.position.Y = (this.position.Y <= this.radius) ? this.radius : lowestPoint;

            // reflection angle is an inverse angle to the perpendicular axis to the wall (in this case the wall is X axis)
            this.velocity.Y = -this.velocity.Y;
            this.velocity = this.velocity.mult(horizontalMovementProperties.hitResistance);
        }

        // update velocity
        this.velocity = this.velocity.mult(horizontalMovementProperties.airResistance);
    }

    /**********************
     * VerticalBall class *
    ***********************/
    const verticalMovementProperties = {
        airResistance: 0.998,
        hitResistance: 0.7,
        speedFactor: 0.07,
        gravity: 0.05
    };

    function VerticalBall(position, velocity, radius, localDimensions) {
        // VerticalBall constructor
        // call the base constructor
        Ball.call(this, position, velocity.mult(verticalMovementProperties.speedFactor), radius, localDimensions);
    }

    VerticalBall.prototype.collision = function(ball) {
        // call the base collision method
        Ball.prototype.collision.call(this, ball);
    }

    VerticalBall.prototype.update = function() {
        var rightMostPoint = this._localDimensions.width - this.radius;
        var lowestPoint = this._localDimensions.height - this.radius;

        if (this.velocity.isNearZero() && this.position.Y == lowestPoint)
            return; // the ball is staying in place

        this.position = this.position.add(this.velocity);

        if (this.position.X <= this.radius || this.position.X >= rightMostPoint) {
            // move ball inside the borders
            this.position.X = (this.position.X <= this.radius) ? this.radius : rightMostPoint;

            // reflection
            this.velocity.X = -this.velocity.X;
        }
        if (this.position.Y <= this.radius || this.position.Y >= lowestPoint) {
            // move ball inside the borders
            this.position.Y = (this.position.Y <= this.radius) ? this.radius : lowestPoint;

            if (this.position.Y == lowestPoint)
                this.velocity = this.velocity.mult(verticalMovementProperties.hitResistance);

            // reflection
            this.velocity.Y = -this.velocity.Y;
        }

        // update velocity
        this.velocity = this.velocity.mult(verticalMovementProperties.airResistance);
        if (this.position.Y == lowestPoint && Math.abs(this.velocity.Y) <= Vector2d.NEAR_ZERO)
            this.velocity.Y = 0; // the ball isn't falling or jumping
        else
            this.velocity.Y += verticalMovementProperties.gravity; // apply gravity
    }

    /* Save these classes as global */
    var Balls = {
        HorizontalBall: HorizontalBall,
        VerticalBall: VerticalBall
    };

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines.
    var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global ||
            this || {};

    // Export the Balls object for **Node.js**, with
    // backwards-compatibility for their old module API. If we're in
    // the browser, add Balls as a global object.
    // (`nodeType` is checked to ensure that `module`
    // and `exports` are not HTML elements.)
    if (typeof exports != 'undefined' && !exports.nodeType) {
        if (typeof module != 'undefined' && !module.nodeType && module.exports) {
            exports = module.exports = Balls;
        }
        exports.Balls = Balls;
    } else {
        root.Balls = Balls;
    }

}());