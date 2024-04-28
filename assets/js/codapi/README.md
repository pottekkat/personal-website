# Codapi Usage Notes

## Uneditable Yaml

```yaml {id="apisix.yaml"}
routes:
  -
    id: example-route-to-httpbin
    uri: /anything/test
    upstream:
      nodes:
        httpbin.org: 1
      type: roundrobin
#END
```

```shell
curl "http://127.0.0.1:9080/anything/test"
```

{{< codapi sandbox="apisix" editor="basic" files="#apisix.yaml" >}}

## Editable Yaml

```yaml {id="apisix.yaml"}
routes:
  -
    id: example-route-to-httpbin
    uri: /anything/test
    upstream:
      nodes:
        httpbin.org: 1
      type: roundrobin
#END
```

{{< codapi sandbox="apisix" editor="basic" hidden=true >}}

```shell
curl "http://127.0.0.1:9080/anything/test"
```

{{< codapi sandbox="apisix" editor="none" files="#apisix.yaml" >}}

## Renaming to apisix.yaml

```yaml {id="example-route-to-httpbin.yaml"}
routes:
  -
    id: example-route-to-httpbin
    uri: /anything/amazing
    upstream:
      nodes:
        httpbin.org: 1
      type: roundrobin
#END
```

{{< codapi sandbox="apisix" editor="basic" hidden=true >}}

```shell
curl "http://127.0.0.1:9080/anything/amazing"
```

{{< codapi sandbox="apisix" editor="none" files="#example-route-to-httpbin.yaml:apisix.yaml" >}}
