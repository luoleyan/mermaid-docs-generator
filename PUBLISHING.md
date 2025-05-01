# 发布指南

本文档提供了将 mermaid-docs-generator 发布到 npm 的步骤。

## 准备工作

1. 确保你有一个 npm 账号。如果没有，请在 [npm 官网](https://www.npmjs.com/) 注册。

2. 在本地登录 npm：

   ```bash
   npm login
   ```

3. 确保 package.json 中的信息正确：
   - name: 包名称
   - version: 版本号
   - description: 包描述
   - author: 作者信息
   - repository: 代码仓库信息
   - homepage: 项目主页
   - bugs: 问题反馈地址

4. 更新 README.md，确保文档清晰完整。

5. 更新 CHANGELOG.md，记录版本变更。

## 测试包

在发布前，确保包可以正常工作：

```bash
npm test
```

## 检查包内容

查看将要发布的文件列表：

```bash
npm pack
```

这将创建一个 .tgz 文件，但不会发布到 npm。你可以解压这个文件，检查其中的内容，确保只包含必要的文件。

## 发布包

### 发布新版本

```bash
npm publish
```

### 发布测试版本

如果你想发布测试版本，可以使用以下命令：

```bash
npm publish --tag beta
```

### 发布特定标签的版本

```bash
npm publish --tag <tag>
```

## 版本管理

使用 npm 的版本管理命令更新版本号：

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
npm version patch

# 次要版本 (1.0.0 -> 1.1.0)
npm version minor

# 主要版本 (1.0.0 -> 2.0.0)
npm version major
```

这些命令会自动更新 package.json 中的版本号，并创建一个 git 标签。

## 发布后检查

发布后，访问 [npm 网站](https://www.npmjs.com/~luoleyan) 检查包是否正确发布。

## 撤销发布

如果发现问题需要撤销发布，可以在发布后 72 小时内使用以下命令：

```bash
npm unpublish mermaid-docs-generator@<version>
```

注意：npm 不鼓励撤销发布，除非有严重问题。
