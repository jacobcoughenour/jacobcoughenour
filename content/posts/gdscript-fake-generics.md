+++
title = 'Faking generics in GDScript with GDScript'
date = 2025-10-15T19:17:39-04:00
draft = true
+++

[Static typing](https://docs.godotengine.org/en/latest/getting_started/scripting/gdscript/static_typing.html) in GDScript is great for [improving the performance](https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/static_typing.html#:~:text=Also%2C%20typed%20GDScript%20improves%20performance) and maintainability of your code. The problem is it's not as complete as similar languages.

One of the issues I have been running into is the lack of typed nullables. So if we have a function that could either return null or Vector2, we can't set the return type to Vector2.

{{< code lang=gdscript >}}
func get_player_position(player_id: int) -> Vector2:
	if _data.has(player_id):
		return _data[player_id].position
	# player not found
	return null
{{</ code >}}

The editor gives us an error on line 5: `Cannot return a value of type "null" as "Vector2"`

Instead of returning null, let's return `Vector2.ZERO`:

{{< code lang=gdscript >}}
func get_player_position(player_id: int) -> Vector2:
	if _data.has(player_id):
		return _data[player_id].position
	# player not found
	return Vector.ZERO
{{</ code >}}

Now when we call it we have to remember to check if the value is `Vector2.ZERO` to know that the player wasn't found.
{{< code lang=gdscript >}}
var p = get_player_position(2) # Vector2
if p != Vector.ZERO:
	var p_vec2 = p as Vector2
	print(p_vec2.distance_to(_local_player))
{{</ code >}}

But this now assumes that `Vector2(0, 0)` is never a valid position which is not true. This is the kind of thing that would introduce a hard to reproduce bug into our code.

The only way around this is to make the return type {{< godot_class class="Variant" >}} or {{< godot_class class="Object" >}} which defeats the whole purpose of defining the return type in the first place.

{{< code lang=gdscript >}}
func get_player_position(player_id: int) -> Variant:
	if _data.has(player_id):
		return _data[player_id].position
	# player not found
	return null
{{</ code >}}

So now if we try to use our function we are always going to have to null check it then cast it back to a {{< godot_class class="Vector2" >}} just so we can get the code completion option for the `distance_to()` method in the editor.
{{< code lang=gdscript >}}
var p = get_player_position(2) # Variant
if p != null:
	var p_vec2 = p as Vector2
	print(p_vec2.distance_to(_local_player))
{{</ code >}}

From what I can tell, this is the official way Godot wants use to handle this scenario.

Ideally, I would want something like this:
{{< code lang=gdscript >}}
func get_player_position(player_id: int) -> Optional[Vector2]:
	if _data.has(player_id):
		return _data[player_id].position
	# player not found
	return null
{{</ code >}}

Then it would simplify what we do with the return value
{{< code lang=gdscript >}}
var p = get_player_position(2) # Optional[Vector2]
if p != null:
	# infer that p is Vector2 now
	print(p.distance_to(_local_player))
{{</ code >}}

_In this example, I'm assuming that it would internally wrap the value and do a bit of type inference to know that `name` isn't null after my null check._

# Generics

If you are coming from another language, your instinct would be to make a generic type that would wrap the value and still retain the type for when you try to unwrap it. A while back, Godot added Typed Arrays and Typed Dictionaries. So now you can specify the type for the items in an array like this:

{{< code lang=gdscript >}}
var a: Array[int] = [1, 2, 3]
{{</ code >}}

You might assume now that GDScript has a way of defining generic types since it supports type parameters for Array and Dictionary, but it doesn't. There is currently no way for me to make `Optional[T]` valid syntax in GDScript without heavily modifying the engine.

# Faking it

When you think about it, we don't need our `Optional` to work with all the possible variable types. Let's just make a version of it that only works with {{< godot_class class="Vector2" >}}.

{{< code lang=gdscript filename=optional_vector2.gd >}}
class_name OptionalVector2
extends Object

var _has_value: bool
var _value: Vector2

func has_value() -> bool:
	return _has_value

func set_value(p_value: Vector2) -> void:
	_has_value = true
	_value = p_value

func value() -> Vector2:
	return _value

static func empty() -> OptionalVector2:
	return OptionalVector2.new()

static func with(p_value: Vector2) -> OptionalVector2:
	var p = OptionalVector2.new()
	p.set_value(p_value)
	return p
{{</ code >}}

Now we can refactor our `get_player_position` method to use it:
{{< code lang=gdscript >}}
func get_player_position(player_id: int) -> OptionalVector2:
	if _data.has(player_id):
		return _data[player_id].position
	# player not found
	return null
# ...
var name = get_player_name(2)
if name.has_value():
	print(name.value().capitalize())
{{</ code >}}

The key here is that `value()` returns a {{< godot_class class="Vector2" >}} while offering a way to check if the value is actually valid. So this fixes our problem where we didn't know if `Vector2(0, 0)` was valid or not.

Also, if we didn't check `has_value()` and our `OptionalVector2` was empty, `value()` would give us a `Vector2(0, 0)` since that is the default value of a {{< godot_class class="Vector2" >}}.

Now let's make an OptionalVector3.

{{< code lang=gdscript filename=optional_vector3.gd >}}
class_name OptionalVector3
extends Object

var _has_value: bool
var _value: Vector3

func has_value() -> bool:
	return _has_value

func set_value(p_value: Vector3) -> void:
	_has_value = true
	_value = p_value

func value() -> Vector3:
	return _value

static func empty() -> OptionalVector3:
	return OptionalVector3.new()

static func with(p_value: Vector3) -> OptionalVector3:
	var p = OptionalVector3.new()
	p.set_value(p_value)
	return p
{{</ code >}}

If you compare it to OptionalVector2, it's almost identical except for all the 2s now being 3s. We can't just make a base class and call it a day because we can't override the methods with mismatched parameters and return types.

We will just have to copy paste and modify for all the `Optional` types we want as we need them. Hopefully we don't find a bug in our implementation and have to manually go back and fix it in all the copies...

Wait a minute. Why don't we just write some code to write the code for us?

# Automating it

I threw together a quick editor plugin to automate the creation of these classes. The way it works is pretty simple. It adds an abstract class call `ScriptGenerator` and then looks for any scripts in your project that implement it. When you run the `Run Script Generators` command in the editor, each script generator generates files that get put in `_generated_` folders. Then you can use those classes in your code base.

Here is my OptionalGenerator:

{{< code lang=gdscript filename=optional_vector3.gd >}}
extends ScriptGenerator

class OptionalTypeSettings:
	var typeName: String
	var valueType: String
	var filename: String
	
	func _init(p_typeName, p_valueType, p_filename):
		typeName = p_typeName
		valueType = p_valueType
		filename = p_filename
	
	func vars():
		return {
			"typeName": typeName,
			"valueType": valueType,
			"filename": filename
		}

func get_source_data() -> Array:
	return [
		OptionalTypeSettings.new("OptionalInt", "int", "int"),
		OptionalTypeSettings.new("OptionalBool", "bool", "bool"),
		OptionalTypeSettings.new("OptionalString", "String", "string"),
		OptionalTypeSettings.new("OptionalDictionary", "Dictionary", "dictionary"),
		# register new types here
	]

func get_file_name(source_data: Variant) -> String:
	return "optional_" + source_data.filename
	
func generate_source(source_data: Variant) -> String:
	return """extends Object
class_name {typeName}

var _has_value: bool
var _value: {valueType}

func has_value() -> bool:
	return _has_value

func set_value(val: {valueType}) -> void:
	_has_value = true
	_value = val

func value() -> {valueType}:
	return _value

static func empty() -> {typeName}:
	return {typeName}.new()

static func with(val: {valueType}) -> {typeName}:
	var p = {typeName}.new()
	p.set_value(val)
	return p
""".format(source_data.vars())
{{</ code >}}


When I run the command it will generate me `OptionalInt`, `OptionalBool`, `OptionalString`, and `OptionalDictionary`. If I want to make an `OptionalVector2`, all I have to do is add it at line 29 then run the generate command again.

[I put the code up on github](https://github.com/jacobcoughenour/gdscript_source_generation) if you want to try it out. I might put it up on the AssetLib/Asset Store at some point. I've included some other example generators in the repo.

I'm curious if anyone else has done something like this with gdscript before. I'm only emulating generic types now but I could see some other applications for this addon like generating fully typed models for my sqlite save file.
