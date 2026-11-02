require 'json'

package = JSON.parse(
  File.read(File.join(__dir__, '..', 'package.json'))
)

Pod::Spec.new do |s|
  s.name          = 'SuniPhotoKit'
  s.version       = package['version']
  s.summary       = package['description']
  s.description   = package['description']
  s.license       = package['license']
  s.author        = 'suni-pro'
  s.homepage      = package['homepage']

  s.platforms     = { :ios => '15.1' }
  s.swift_version = '5.9'

  s.source = {
    :git => 'https://github.com/suni-pro/expo-photokit.git',
    :tag => s.version.to_s
  }

  s.source_files = '**/*.swift'
  s.dependency 'ExpoModulesCore'
end
