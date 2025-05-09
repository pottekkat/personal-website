---
title: "\"omitempty\" option omits boolean fields with false values"
date: 2025-05-09T22:28:35+05:30
description: "And how to fix it."
fmContentType: TILs
---

The `omitempty` option in the Go standard library's `encoding/json` package omits boolean fields with `false` values.

{{< blockquote author="" link="https://pkg.go.dev/encoding/json#Marshal" title="https://pkg.go.dev/encoding/json#Marshal" >}}
The "omitempty" option specifies that the field should be omitted from the encoding if the field has an empty value, defined as false, 0, a nil pointer, a nil interface value, and any array, slice, map, or string of length zero.
{{< /blockquote >}}

This means that if you use the `omitempty` option on a boolean field, the field is omitted when it is `false`:

```go
type AppConfig struct {
    FlagValue bool `json:"flag_value,omitempty"`
}

func main() {
    ac, _ := json.Marshal(AppConfig{true})
    fmt.Println(string(ac))
    ac, _ = json.Marshal(AppConfig{false})
    fmt.Println(string(ac)) 
}
```

```text {title="output"}
{"flag_value":true}
{}
```

Which is unexpected, because you expect the second line to be `{"flag_value":false}`.

To fix this, you can use a pointer to a boolean instead:

```go
type AppConfig struct {
    FlagValue *bool `json:"flag_value,omitempty"`
}

func main() {
    fv := true
    ac, _ := json.Marshal(AppConfig{&fv})
    fmt.Println(string(ac))
    fv = false
    ac, _ = json.Marshal(AppConfig{&fv})
    fmt.Println(string(ac))
}
```

```text {title="output"}
{"flag_value":true}
{"flag_value":false}
```

To differentiate between unset and zero values for any data type, use pointers.
