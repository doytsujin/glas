/**
 * @author bhouston / http://exocortex.com
 * @author TristanVALCKE / https://github.com/Itee
 * @author jtenner / https://github.com/jtenner
 */

import { Ray } from './Ray'
import { Box3 } from './Box3'
import { Vector3 } from './Vector3'
import { Sphere } from './Sphere'
import { Plane } from './Plane'
import { Matrix4 } from './Matrix4'
import { zero3, one3, two3, eps, posInf3 } from './test-constants'

describe('Maths', () => {
	describe('Ray', () => {
		// INSTANCING
		test('Instancing', () => {
			let a = new Ray()
			expect(a.origin).toStrictEqual(zero3)
			expect(a.direction).toStrictEqual(new Vector3(0, 0, -1))

			a = new Ray(two3.clone(), one3.clone())
			expect(a.origin).toStrictEqual(two3)
			expect(a.direction).toStrictEqual(one3)
		})

		test('set', () => {
			const a = new Ray()

			a.set(one3, one3)
			expect(a.origin).toStrictEqual(one3)
			expect(a.direction).toStrictEqual(one3)
		})

		test('recast/clone', () => {
			const a = new Ray(one3.clone(), new Vector3(0, 0, 1))

			expect(a.recast(0).equals(a)).toBeTruthy()

			const b = a.clone()
			expect(b.recast(-1).equals(new Ray(new Vector3(1, 1, 0), new Vector3(0, 0, 1)))).toBeTruthy()

			const c = a.clone()
			expect(c.recast(1).equals(new Ray(new Vector3(1, 1, 2), new Vector3(0, 0, 1)))).toBeTruthy()

			const d = a.clone()
			const e = d.clone().recast(1)
			expect(d.equals(a)).toBeTruthy()
			expect(e.equals(d)).toBeFalsy()
			expect(e.equals(c)).toBeTruthy()
		})

		test('copy/equals', () => {
			const a = new Ray(zero3.clone(), one3.clone())
			const b = new Ray().copy(a)
			expect(b.origin.equals(zero3)).toBeTruthy()
			expect(b.direction.equals(one3)).toBeTruthy()

			// ensure that it is a true copy
			a.origin = zero3
			a.direction = one3
			expect(b.origin.equals(zero3)).toBeTruthy()
			expect(b.direction.equals(one3)).toBeTruthy()
		})

		test('at', () => {
			const a = new Ray(one3.clone(), new Vector3(0, 0, 1))
			const point = new Vector3()

			a.at(0, point)
			expect(point.equals(one3)).toBeTruthy()
			a.at(-1, point)
			expect(point.equals(new Vector3(1, 1, 0))).toBeTruthy()
			a.at(1, point)
			expect(point.equals(new Vector3(1, 1, 2))).toBeTruthy()
		})

		test('lookAt', () => {
			const a = new Ray(two3.clone(), one3.clone())
			const target = one3.clone()
			const expected = target.sub(two3).normalize()

			a.lookAt(target)
			expect(a.direction.equals(expected)).toBeTruthy()
		})

		test('closestPointToPoint', () => {
			const a = new Ray(one3.clone(), new Vector3(0, 0, 1))
			const point = new Vector3()

			// behind the ray
			a.closestPointToPoint(zero3, point)
			expect(point.equals(one3)).toBeTruthy()

			// front of the ray
			a.closestPointToPoint(new Vector3(0, 0, 50), point)
			expect(point.equals(new Vector3(1, 1, 50))).toBeTruthy()

			// exactly on the ray
			a.closestPointToPoint(one3, point)
			expect(point.equals(one3)).toBeTruthy()
		})

		test('distanceToPoint', () => {
			const a = new Ray(one3.clone(), new Vector3(0, 0, 1))

			// behind the ray
			const b = a.distanceToPoint(zero3)
			expect(b).toBeCloseTo(Mathf.sqrt(3))

			// front of the ray
			const c = a.distanceToPoint(new Vector3(0, 0, 50))
			expect(c).toBeCloseTo(Mathf.sqrt(2))

			// exactly on the ray
			const d = a.distanceToPoint(one3)
			expect(d).toBeCloseTo(0)
		})

		test('distanceSqToPoint', () => {
			const a = new Ray(one3.clone(), new Vector3(0, 0, 1))

			// behind the ray
			const b = a.distanceSqToPoint(zero3)
			expect(b).toBeCloseTo(3)

			// front of the ray
			const c = a.distanceSqToPoint(new Vector3(0, 0, 50))
			expect(c).toBeCloseTo(2)

			// exactly on the ray
			const d = a.distanceSqToPoint(one3)
			expect(d).toBeCloseTo(0)
		})

		test('distanceSqToSegment', () => {
			const a = new Ray(one3.clone(), new Vector3(0, 0, 1))
			const ptOnLine = new Vector3()
			const ptOnSegment = new Vector3()

			//segment in front of the ray
			let v0 = new Vector3(3, 5, 50)
			let v1 = new Vector3(50, 50, 50) // just a far away point
			let distSqr = a.distanceSqToSegment(v0, v1, ptOnLine, ptOnSegment)

			expect(ptOnSegment.distanceTo(v0)).toBeCloseTo(0)
			expect(ptOnLine.distanceTo(new Vector3(1, 1, 50))).toBeCloseTo(0)
			// ((3-1) * (3-1) + (5-1) * (5-1) = 4 + 16 = 20
			expect(distSqr).toBeCloseTo(20)

			//segment behind the ray
			v0 = new Vector3(-50, -50, -50) // just a far away point
			v1 = new Vector3(-3, -5, -4)
			distSqr = a.distanceSqToSegment(v0, v1, ptOnLine, ptOnSegment)

			expect(ptOnSegment.distanceTo(v1)).toBeCloseTo(0)
			expect(ptOnLine.distanceTo(one3)).toBeCloseTo(0)
			// ((-3-1) * (-3-1) + (-5-1) * (-5-1) + (-4-1) + (-4-1) = 16 + 36 + 25 = 77
			expect(distSqr).toBeCloseTo(77)

			//exact intersection between the ray and the segment
			v0 = new Vector3(-50, -50, -50)
			v1 = new Vector3(50, 50, 50)
			distSqr = a.distanceSqToSegment(v0, v1, ptOnLine, ptOnSegment)

			expect(ptOnSegment.distanceTo(one3)).toBeCloseTo(0)
			expect(ptOnLine.distanceTo(one3)).toBeCloseTo(0)
			expect(distSqr).toBeCloseTo(0)
		})

		test('intersectSphere', () => {
			const TOL = <f32>0.0001
			const point = new Vector3()

			// ray a0 origin located at ( 0, 0, 0 ) and points outward in negative-z direction
			const a0 = new Ray(zero3.clone(), new Vector3(0, 0, -1))
			// ray a1 origin located at ( 1, 1, 1 ) and points left in negative-x direction
			const a1 = new Ray(one3.clone(), new Vector3(-1, 0, 0))

			// sphere (radius of 2) located behind ray a0, should result in null
			let b = new Sphere(new Vector3(0, 0, 3), 2)
			a0.intersectSphere(b, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()

			// sphere (radius of 2) located in front of, but too far right of ray a0, should result in null
			b = new Sphere(new Vector3(3, 0, -1), 2)
			a0.intersectSphere(b, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()

			// sphere (radius of 2) located below ray a1, should result in null
			b = new Sphere(new Vector3(1, -2, 1), 2)
			a1.intersectSphere(b, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()

			// sphere (radius of 1) located to the left of ray a1, should result in intersection at 0, 1, 1
			b = new Sphere(new Vector3(-1, 1, 1), 1)
			a1.intersectSphere(b, point)
			expect(point.distanceTo(new Vector3(0, 1, 1))).toBeLessThan(TOL)

			// sphere (radius of 1) located in front of ray a0, should result in intersection at 0, 0, -1
			b = new Sphere(new Vector3(0, 0, -2), 1)
			a0.intersectSphere(b, point)
			expect(point.distanceTo(new Vector3(0, 0, -1))).toBeLessThan(TOL)

			// sphere (radius of 2) located in front & right of ray a0, should result in intersection at 0, 0, -1, or left-most edge of sphere
			b = new Sphere(new Vector3(2, 0, -1), 2)
			a0.intersectSphere(b, point)
			expect(point.distanceTo(new Vector3(0, 0, -1))).toBeLessThan(TOL)

			// same situation as above, but move the sphere a fraction more to the right, and ray a0 should now just miss
			b = new Sphere(new Vector3(2.01, 0, -1), 2)
			a0.intersectSphere(b, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()

			// following tests are for situations where the ray origin is inside the sphere

			// sphere (radius of 1) center located at ray a0 origin / sphere surrounds the ray origin, so the first intersect point 0, 0, 1,
			// is behind ray a0.  Therefore, second exit point on back of sphere will be returned: 0, 0, -1
			// thus keeping the intersection point always in front of the ray.
			b = new Sphere(zero3.clone(), 1)
			a0.intersectSphere(b, point)
			expect(point.distanceTo(new Vector3(0, 0, -1))).toBeLessThan(TOL)

			// sphere (radius of 4) center located behind ray a0 origin / sphere surrounds the ray origin, so the first intersect point 0, 0, 5,
			// is behind ray a0.  Therefore, second exit point on back of sphere will be returned: 0, 0, -3
			// thus keeping the intersection point always in front of the ray.
			b = new Sphere(new Vector3(0, 0, 1), 4)
			a0.intersectSphere(b, point)
			expect(point.distanceTo(new Vector3(0, 0, -3))).toBeLessThan(TOL)

			// sphere (radius of 4) center located in front of ray a0 origin / sphere surrounds the ray origin, so the first intersect point 0, 0, 3,
			// is behind ray a0.  Therefore, second exit point on back of sphere will be returned: 0, 0, -5
			// thus keeping the intersection point always in front of the ray.
			b = new Sphere(new Vector3(0, 0, -1), 4)
			a0.intersectSphere(b, point)
			expect(point.distanceTo(new Vector3(0, 0, -5))).toBeLessThan(TOL)
		})

		test('intersectsSphere', () => {
			const a = new Ray(one3.clone(), new Vector3(0, 0, 1))
			const b = new Sphere(zero3, 0.5)
			const c = new Sphere(zero3, 1.5)
			const d = new Sphere(one3, 0.1)
			const e = new Sphere(two3, 0.1)
			const f = new Sphere(two3, 1)

			expect(a.intersectsSphere(b)).toBeFalsy()
			expect(a.intersectsSphere(c)).toBeFalsy()
			expect(a.intersectsSphere(d)).toBeTruthy()
			expect(a.intersectsSphere(e)).toBeFalsy()
			expect(a.intersectsSphere(f)).toBeFalsy()
		})

		test('intersectPlane', () => {
			const a = new Ray(one3.clone(), new Vector3(0, 0, 1))
			const point = new Vector3()

			// parallel plane behind
			const b = new Plane().setFromNormalAndCoplanarPoint(new Vector3(0, 0, 1), new Vector3(1, 1, -1))
			a.intersectPlane(b, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()

			// parallel plane coincident with origin
			const c = new Plane().setFromNormalAndCoplanarPoint(new Vector3(0, 0, 1), new Vector3(1, 1, 0))
			a.intersectPlane(c, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()

			// parallel plane infront
			const d = new Plane().setFromNormalAndCoplanarPoint(new Vector3(0, 0, 1), new Vector3(1, 1, 1))
			a.intersectPlane(d, point.copy(posInf3))
			expect(point.equals(a.origin)).toBeTruthy()

			// perpendical ray that overlaps exactly
			const e = new Plane().setFromNormalAndCoplanarPoint(new Vector3(1, 0, 0), one3)
			a.intersectPlane(e, point.copy(posInf3))
			expect(point.equals(a.origin)).toBeTruthy()

			// perpendical ray that doesn't overlap
			const f = new Plane().setFromNormalAndCoplanarPoint(new Vector3(1, 0, 0), zero3)
			a.intersectPlane(f, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()
		})

		test('intersectsPlane', () => {
			const a = new Ray(one3.clone(), new Vector3(0, 0, 1))

			// parallel plane in front of the ray
			const b = new Plane().setFromNormalAndCoplanarPoint(
				new Vector3(0, 0, 1),
				one3.clone().sub(new Vector3(0, 0, -1))
			)
			expect(a.intersectsPlane(b)).toBeTruthy()

			// parallel plane coincident with origin
			const c = new Plane().setFromNormalAndCoplanarPoint(
				new Vector3(0, 0, 1),
				one3.clone().sub(new Vector3(0, 0, 0))
			)
			expect(a.intersectsPlane(c)).toBeTruthy()

			// parallel plane behind the ray
			const d = new Plane().setFromNormalAndCoplanarPoint(
				new Vector3(0, 0, 1),
				one3.clone().sub(new Vector3(0, 0, 1))
			)
			expect(a.intersectsPlane(d)).toBeFalsy()

			// perpendical ray that overlaps exactly
			const e = new Plane().setFromNormalAndCoplanarPoint(new Vector3(1, 0, 0), one3)
			expect(a.intersectsPlane(e)).toBeTruthy()

			// perpendical ray that doesn't overlap
			const f = new Plane().setFromNormalAndCoplanarPoint(new Vector3(1, 0, 0), zero3)
			expect(a.intersectsPlane(f)).toBeFalsy()
		})

		test('intersectBox', () => {
			const TOL = <f32>0.0001

			const box = new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))
			const point = new Vector3()

			const a = new Ray(new Vector3(-2, 0, 0), new Vector3(1, 0, 0))
			//ray should intersect box at -1,0,0
			expect(a.intersectsBox(box)).toBeTruthy()
			a.intersectBox(box, point)
			expect(point.distanceTo(new Vector3(-1, 0, 0))).toBeLessThan(TOL)

			const b = new Ray(new Vector3(-2, 0, 0), new Vector3(-1, 0, 0))
			//ray is point away from box, it should not intersect
			expect(b.intersectsBox(box)).toBeFalsy()
			b.intersectBox(box, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()

			const c = new Ray(new Vector3(0, 0, 0), new Vector3(1, 0, 0))
			// ray is inside box, should return exit point
			expect(c.intersectsBox(box)).toBeTruthy()
			c.intersectBox(box, point)
			expect(point.distanceTo(new Vector3(1, 0, 0))).toBeLessThan(TOL)

			const d = new Ray(new Vector3(0, 2, 1), new Vector3(0, -1, -1).normalize())
			//tilted ray should intersect box at 0,1,0
			expect(d.intersectsBox(box)).toBeTruthy()
			d.intersectBox(box, point)
			expect(point.distanceTo(new Vector3(0, 1, 0))).toBeLessThan(TOL)

			const e = new Ray(new Vector3(1, -2, 1), new Vector3(0, 1, 0).normalize())
			//handle case where ray is coplanar with one of the boxes side - box in front of ray
			expect(e.intersectsBox(box)).toBeTruthy()
			e.intersectBox(box, point)
			expect(point.distanceTo(new Vector3(1, -1, 1))).toBeLessThan(TOL)

			const f = new Ray(new Vector3(1, -2, 0), new Vector3(0, -1, 0).normalize())
			//handle case where ray is coplanar with one of the boxes side - box behind ray
			expect(f.intersectsBox(box)).toBeFalsy()
			f.intersectBox(box, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()
		})

		test('intersectTriangle', () => {
			const ray = new Ray()
			const a = new Vector3(1, 1, 0)
			const b = new Vector3(0, 1, 1)
			const c = new Vector3(1, 0, 1)
			const point = new Vector3()

			// DdN == 0
			ray.set(ray.origin, zero3.clone())
			ray.intersectTriangle(a, b, c, false, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()

			// DdN > 0, backfaceCulling = true
			ray.set(ray.origin, one3.clone())
			ray.intersectTriangle(a, b, c, true, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()

			// DdN > 0
			ray.set(ray.origin, one3.clone())
			ray.intersectTriangle(a, b, c, false, point)
			expect(abs<f32>(point.x - 2 / 3)).toBeLessThan(eps)
			expect(abs<f32>(point.y - 2 / 3)).toBeLessThan(eps)
			expect(abs<f32>(point.z - 2 / 3)).toBeLessThan(eps)

			// DdN > 0, DdQxE2 < 0
			b.multiplyScalar(-1)
			ray.intersectTriangle(a, b, c, false, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()

			// DdN > 0, DdE1xQ < 0
			a.multiplyScalar(-1)
			ray.intersectTriangle(a, b, c, false, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()

			// DdN > 0, DdQxE2 + DdE1xQ > DdN
			b.multiplyScalar(-1)
			ray.intersectTriangle(a, b, c, false, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()

			// DdN < 0, QdN < 0
			a.multiplyScalar(-1)
			b.multiplyScalar(-1)
			ray.direction.multiplyScalar(-1)
			ray.intersectTriangle(a, b, c, false, point.copy(posInf3))
			expect(point.equals(posInf3)).toBeTruthy()
		})

		test('applyMatrix4', () => {
			let a = new Ray(one3.clone(), new Vector3(0, 0, 1))
			const m = new Matrix4()

			expect(a.clone().applyMatrix4(m).equals(a)).toBeTruthy()

			a = new Ray(zero3.clone(), new Vector3(0, 0, 1))
			m.makeRotationZ(Mathf.PI)
			expect(a.clone().applyMatrix4(m).equals(a)).toBeTruthy()

			m.makeRotationX(Mathf.PI)
			const b = a.clone()
			b.direction.negate()
			let a2 = a.clone().applyMatrix4(m)
			expect(a2.origin.distanceTo(b.origin)).toBeCloseTo(0)
			expect(a2.direction.distanceTo(b.direction)).toBeCloseTo(0)

			a.origin = new Vector3(0, 0, 1)
			b.origin = new Vector3(0, 0, -1)
			a2 = a.clone().applyMatrix4(m)
			expect(a2.origin.distanceTo(b.origin)).toBeCloseTo(0)
			expect(a2.direction.distanceTo(b.direction)).toBeCloseTo(0)
		})
	})
})
