(function(){
    "use strict";

    const NEAR_ZERO = 0.01;

    // Note: this class should be used as immutable class?????
    function Vector2d(x, y) {
        // constructor for 2 dimensional vector
        this.X = x;
        this.Y = y;
    }

    Vector2d.prototype.length = function() {
        // lenght of this vector (Pythagorean theorem)
        return Math.sqrt(this.X*this.X + this.Y*this.Y)
    }

    Vector2d.prototype.distance = function(v) {
        // distance from this to 'v' vector (Euclidean distance formula)
        return this.sub(v).length();
    }

    Vector2d.prototype.angle = function() {
        // angle between X axis and this vector measured counter-clockwise
        return Math.atan2(this.X, this.Y);
    }

    Vector2d.prototype.normalize = function() {
        // convert to unit vector, vector with length of 1 (distance between origin and this vector)
        return this.div(this.length());
    }

    Vector2d.prototype.convertToLocal = function(dimensions) {
        // convert coordinates to local units
        return new Vector2d(
            this.X - dimensions.left,
            this.Y - dimensions.top
        ).div(dimensions.scaleRatio);
    }

    Vector2d.prototype.mult = function(factor) {
        // multiply this vector by constant 'factor'
        return new Vector2d(
            this.X * factor,
            this.Y * factor
        );
    }

    Vector2d.prototype.div = function(factor) {
        // divide this vector by constant 'factor'
        return new Vector2d(
            this.X / factor,
            this.Y / factor
        );
    }

    Vector2d.prototype.add = function(v) {
        // add 'v' to this vector
        return new Vector2d(
            v.X + this.X,
            v.Y + this.Y
        );
    }
    
    Vector2d.prototype.sub = function(v) {
        // substract 'v' from this vector (direction from this to 'v' vector)
        return new Vector2d(
            this.X - v.X,
            this.Y - v.Y
        );
    };

    Vector2d.prototype.dot = function(v) {
        // dot product between this and 'v' vector
        return this.X * v.X + this.Y * v.Y;
    };

    Vector2d.prototype.opposite = function() {
        // opposite from this vector
        return new Vector2d(
            -this.X,
            -this.Y
        );
    };

    Vector2d.prototype.direction = function(v) {
        // direction from this to 'v' vector
        return this.sub(v).opposite();
    };

    Vector2d.prototype.isNearZero = function() {
        // check if near zero vector
        return this.length() < NEAR_ZERO;
    }

    Vector2d.prototype.clone = function() {
        // clone this vector
        return new Vector2d(this.X, this.Y);
    }

    Vector2d.zero = function() {
        // static function for a zero vector
        return new Vector2d(0, 0);
    }

    window.Vector2d = Vector2d;

}());